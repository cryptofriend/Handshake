import { useCallback } from 'react';
import bs58 from 'bs58';
import { useAppStore } from '@/store/appStore';
import { supabase } from '@/integrations/supabase/client';
import { useTonProofSign } from '@/hooks/useTonProofSign';

interface SignOpts {
  agreementId: string;
  partyName?: string;
  participantId?: string;
}

export interface SignResult {
  ok: boolean;
  txHash?: string;
  address?: string;
  method?: 'ton' | 'solana' | 'world';
  error?: string;
}

/**
 * Unified signing hook — dispatches to the right flow based on the user's
 * authenticated identity (TON / Solana / World ID).
 *
 * - TON      → useTonProofSign (gasless ton_proof, on-chain attestable)
 * - Solana   → Phantom signMessage of agreement fingerprint, recorded server-side
 * - World ID → reuses login proof, recorded server-side keyed to nullifier
 */
export function useSignAgreement() {
  const authIdentity = useAppStore((s) => s.authIdentity);
  const { signWithProof } = useTonProofSign();

  const sign = useCallback(
    async (opts: SignOpts): Promise<SignResult> => {
      if (!authIdentity) {
        return { ok: false, error: 'Not signed in' };
      }

      if (authIdentity.method === 'ton') {
        const r = await signWithProof(opts);
        return { ...r, method: 'ton', address: authIdentity.address };
      }

      if (authIdentity.method === 'solana') {
        try {
          const provider = (window as any).solana;
          if (!provider?.isPhantom) {
            return { ok: false, error: 'Phantom wallet not available' };
          }
          if (!provider.publicKey) {
            await provider.connect();
          }
          const message = `Handshake — sign agreement ${opts.agreementId} at ${new Date().toISOString()}`;
          const encoded = new TextEncoder().encode(message);
          const { signature } = await provider.signMessage(encoded, 'utf8');
          const proof = JSON.stringify({
            message,
            signature: bs58.encode(signature),
          });

          const { data, error } = await supabase.functions.invoke('verify-signature', {
            body: {
              agreementId: opts.agreementId,
              method: 'solana',
              address: authIdentity.address,
              proof,
              partyName: opts.partyName,
              participantId: opts.participantId,
            },
          });
          if (error) return { ok: false, error: error.message || 'Verification failed' };
          if (data?.error) return { ok: false, error: data.error };
          return {
            ok: true,
            method: 'solana',
            address: authIdentity.address,
            txHash: data?.signature?.tx_hash,
          };
        } catch (e: any) {
          if (e?.message?.toLowerCase().includes('reject')) {
            return { ok: false, error: 'cancelled' };
          }
          return { ok: false, error: e?.message || 'Solana signing failed' };
        }
      }

      if (authIdentity.method === 'world') {
        try {
          // Reuse the World ID proof captured at login.
          const proof = authIdentity.proof || JSON.stringify({
            nullifier_hash: authIdentity.address,
          });

          const { data, error } = await supabase.functions.invoke('verify-signature', {
            body: {
              agreementId: opts.agreementId,
              method: 'world',
              address: authIdentity.address,
              proof,
              partyName: opts.partyName,
              participantId: opts.participantId,
            },
          });
          if (error) return { ok: false, error: error.message || 'Verification failed' };
          if (data?.error) return { ok: false, error: data.error };
          return {
            ok: true,
            method: 'world',
            address: authIdentity.address,
            txHash: data?.signature?.tx_hash,
          };
        } catch (e: any) {
          return { ok: false, error: e?.message || 'World ID signing failed' };
        }
      }

      return { ok: false, error: 'Unknown auth method' };
    },
    [authIdentity, signWithProof]
  );

  return { sign, identity: authIdentity };
}
