import { useCallback, useRef } from 'react';
import { useTonConnectUI, useTonAddress } from '@tonconnect/ui-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface TonProofResult {
  walletAddress: string;
  proof: {
    timestamp: number;
    domain: { lengthBytes: number; value: string };
    payload: string;
    signature: string;
  };
}

/**
 * Hook that handles gasless signing via ton_proof.
 * Flow:
 * 1. Fetch a challenge payload from generate-proof-payload
 * 2. Disconnect and reconnect wallet with ton_proof request
 * 3. Wallet signs the proof cryptographically (no gas)
 * 4. Submit proof to verify-ton-proof to record signature
 */
export function useTonProofSign() {
  const [tonConnectUI] = useTonConnectUI();
  const userAddress = useTonAddress();
  const proofResolverRef = useRef<{
    resolve: (result: TonProofResult | null) => void;
  } | null>(null);

  const signWithProof = useCallback(
    async (opts: {
      agreementId: string;
      partyName?: string;
      participantId?: string;
    }): Promise<{ ok: boolean; txHash?: string; error?: string }> => {
      try {
        // 1. Get challenge payload from backend
        const { data: payloadData, error: payloadError } = await supabase.functions.invoke(
          'generate-proof-payload',
          { method: 'POST', body: {} }
        );

        if (payloadError || !payloadData?.payload) {
          return { ok: false, error: 'Failed to generate proof payload' };
        }

        const proofPayload = payloadData.payload;

        // 2. Set up ton_proof connect request
        tonConnectUI.setConnectRequestParameters({
          state: 'ready',
          value: { tonProof: proofPayload },
        });

        // 3. Disconnect current wallet to trigger reconnection with proof
        const wasConnected = !!userAddress;
        if (wasConnected) {
          await tonConnectUI.disconnect();
        }

        // 4. Wait for wallet reconnection with proof
        const proofResult = await new Promise<TonProofResult | null>(
          (resolve) => {
            proofResolverRef.current = { resolve };

            const unsubscribe = tonConnectUI.onStatusChange((wallet) => {
              if (wallet?.connectItems?.tonProof && 'proof' in wallet.connectItems.tonProof) {
                const proof = wallet.connectItems.tonProof.proof;
                unsubscribe();
                // Clear the proof request
                tonConnectUI.setConnectRequestParameters(null);
                resolve({
                  walletAddress: wallet.account.address,
                  proof: {
                    timestamp: proof.timestamp,
                    domain: proof.domain,
                    payload: proof.payload,
                    signature: proof.signature,
                  },
                });
              } else if (wallet && !wallet.connectItems?.tonProof) {
                // Connected but no proof (shouldn't happen)
                unsubscribe();
                tonConnectUI.setConnectRequestParameters(null);
                resolve(null);
              }
            });

            // Open the connect modal
            tonConnectUI.openModal();

            // Timeout after 2 minutes
            setTimeout(() => {
              unsubscribe();
              tonConnectUI.setConnectRequestParameters(null);
              resolve(null);
            }, 120_000);
          }
        );

        if (!proofResult) {
          return { ok: false, error: 'Wallet proof not received' };
        }

        // 5. Submit proof to backend
        const { data: verifyData, error: verifyError } = await supabase.functions.invoke(
          'verify-ton-proof',
          {
            method: 'POST',
            body: {
              agreementId: opts.agreementId,
              walletAddress: proofResult.walletAddress,
              proof: proofResult.proof,
              partyName: opts.partyName,
              participantId: opts.participantId,
            },
          }
        );

        if (verifyError) {
          const errMsg = typeof verifyError === 'object' && 'message' in verifyError
            ? (verifyError as any).message
            : 'Verification failed';
          return { ok: false, error: errMsg };
        }

        if (verifyData?.error) {
          return { ok: false, error: verifyData.error };
        }

        return {
          ok: true,
          txHash: verifyData?.signature?.tx_hash,
        };
      } catch (err: any) {
        if (err?.message?.includes('Cancelled') || err?.message?.includes('canceled')) {
          return { ok: false, error: 'cancelled' };
        }
        return { ok: false, error: err?.message || 'Unknown error' };
      }
    },
    [tonConnectUI, userAddress]
  );

  return { signWithProof };
}
