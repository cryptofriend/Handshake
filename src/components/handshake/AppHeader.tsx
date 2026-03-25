import { Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ModeSwitcher } from '@/components/handshake/ModeSwitcher';
import { useTonAddress, useTonConnectModal } from '@tonconnect/ui-react';

export const AppHeader = () => {
  const userAddress = useTonAddress();
  const { open: openTonModal } = useTonConnectModal();

  return (
    <div className="flex items-center justify-between px-5 pt-4 pb-2 w-full max-w-md mx-auto">
      <h1 className="logo-text text-xl text-foreground">Handshake</h1>
      <div className="flex items-center gap-2">
        <ModeSwitcher />
        {userAddress ? (
          <span className="text-xs text-muted-foreground font-mono truncate max-w-[80px]">
            {userAddress.slice(0, 4)}...{userAddress.slice(-4)}
          </span>
        ) : (
          <Button
            variant="outline"
            size="sm"
            className="rounded-xl gap-1.5 text-xs h-8"
            onClick={() => openTonModal()}
          >
            <Wallet className="w-3.5 h-3.5" />
            Sign in
          </Button>
        )}
      </div>
    </div>
  );
};
