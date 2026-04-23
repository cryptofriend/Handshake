import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Wallet, Globe, Loader2 } from 'lucide-react';
import { useTonAddress, useTonConnectModal, useTonConnectUI } from '@tonconnect/ui-react';
import { IDKitWidget, VerificationLevel, type ISuccessResult } from '@worldcoin/idkit';
import bs58 from 'bs58';
import { toast } from 'sonner';
import { useAppStore, type AuthMethod } from '@/store/appStore';

interface LoginDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

// World ID app id — replace with real one in env later
const WORLD_APP_ID = (import.meta.env.VITE_WORLD_APP_ID as string) || 'app_staging_handshake';

declare global {
  interface Window {
    solana?: {
      isPhantom?: boolean;
      connect: () => Promise<{ publicKey: { toString: () => string } }>;
      signMessage: (msg: Uint8Array, encoding?: string) => Promise<{ signature: Uint8Array }>;
    };
  }
}

export const LoginDialog = ({ open, onOpenChange, onSuccess }: LoginDialogProps) => {
  const setAuthIdentity = useAppStore((s) => s.setAuthIdentity);
  const tonAddress = useTonAddress();
  const { open: openTon } = useTonConnectModal();
  const [tonConnectUI] = useTonConnectUI();
  const [busy, setBusy] = useState<AuthMethod | null>(null);

  const finish = (method: AuthMethod, address: string, proof?: string) => {
    setAuthIdentity({
      method,
      address,
      displayName: method === 'world' ? 'World ID Verified' : `${address.slice(0, 6)}...${address.slice(-4)}`,
      signedAt: new Date().toISOString(),
      proof,
    });
    toast.success(`Signed in with ${method.toUpperCase()}`);
    onOpenChange(false);
    onSuccess?.();
  };

  const handleTon = async () => {
    setBusy('ton');
    try {
      if (tonAddress) {
        finish('ton', tonAddress);
        return;
      }
      // Listener resolves once the user approves
      const unsub = tonConnectUI.onStatusChange((wallet) => {
        if (wallet?.account?.address) {
          unsub();
          finish('ton', wallet.account.address);
        }
      });
      onOpenChange(false);
      setTimeout(() => openTon(), 150);
    } catch (e: any) {
      toast.error(e?.message || 'TON connect failed');
    } finally {
      setBusy(null);
    }
  };

  const handleSolana = async () => {
    setBusy('solana');
    try {
      const provider = window.solana;
      if (!provider?.isPhantom) {
        toast.error('Phantom wallet not detected. Install it from phantom.app');
        window.open('https://phantom.app/', '_blank');
        return;
      }
      const resp = await provider.connect();
      const address = resp.publicKey.toString();
      const nonce = `Handshake login ${new Date().toISOString()} :: ${crypto.randomUUID()}`;
      const encoded = new TextEncoder().encode(nonce);
      const { signature } = await provider.signMessage(encoded, 'utf8');
      const sigB58 = bs58.encode(signature);
      finish('solana', address, JSON.stringify({ nonce, signature: sigB58 }));
    } catch (e: any) {
      if (!e?.message?.toLowerCase().includes('reject')) {
        toast.error(e?.message || 'Solana sign-in failed');
      }
    } finally {
      setBusy(null);
    }
  };

  const handleWorldSuccess = (result: ISuccessResult) => {
    finish('world', result.nullifier_hash, JSON.stringify(result));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-center">Sign in to Handshake</DialogTitle>
          <DialogDescription className="text-center text-xs">
            Choose how you want to verify yourself. Each method enables a different signing flow.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 pt-2">
          <Button
            onClick={handleTon}
            disabled={!!busy}
            className="w-full justify-start h-14 rounded-2xl gap-3 bg-[hsl(218,90%,60%)] hover:bg-[hsl(218,90%,55%)] text-white"
          >
            {busy === 'ton' ? <Loader2 className="w-5 h-5 animate-spin" /> : <Wallet className="w-5 h-5" />}
            <div className="flex flex-col items-start">
              <span className="text-sm font-semibold">Continue with TON</span>
              <span className="text-[10px] opacity-80">Tonkeeper, MyTonWallet · gasless ton_proof</span>
            </div>
          </Button>

          <Button
            onClick={handleSolana}
            disabled={!!busy}
            variant="outline"
            className="w-full justify-start h-14 rounded-2xl gap-3 border-[hsl(265,80%,65%)]/40 hover:bg-[hsl(265,80%,65%)]/10"
          >
            {busy === 'solana' ? <Loader2 className="w-5 h-5 animate-spin" /> : (
              <span className="w-5 h-5 rounded-full bg-gradient-to-br from-[hsl(265,80%,65%)] to-[hsl(170,70%,55%)]" />
            )}
            <div className="flex flex-col items-start">
              <span className="text-sm font-semibold">Continue with Solana</span>
              <span className="text-[10px] text-muted-foreground">Phantom · off-chain message signing</span>
            </div>
          </Button>

          <IDKitWidget
            app_id={WORLD_APP_ID as `app_${string}`}
            action="handshake-login"
            verification_level={VerificationLevel.Device}
            onSuccess={handleWorldSuccess}
          >
            {({ open: openWorld }) => (
              <Button
                onClick={() => openWorld()}
                disabled={!!busy}
                variant="outline"
                className="w-full justify-start h-14 rounded-2xl gap-3 border-foreground/20 hover:bg-foreground/5"
              >
                <Globe className="w-5 h-5" />
                <div className="flex flex-col items-start">
                  <span className="text-sm font-semibold">Continue with World ID</span>
                  <span className="text-[10px] text-muted-foreground">Proof of personhood · World App</span>
                </div>
              </Button>
            )}
          </IDKitWidget>
        </div>

        <p className="text-[10px] text-muted-foreground text-center pt-2">
          Your signing flow adapts to the method you choose.
        </p>
      </DialogContent>
    </Dialog>
  );
};
