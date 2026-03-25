import { useTonAddress, useTonConnectModal } from '@tonconnect/ui-react';
import { Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const RequireWallet = ({ children }: { children: React.ReactNode }) => {
  const address = useTonAddress();
  const { open } = useTonConnectModal();

  if (!address) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-5">
        <Card className="p-8 w-full max-w-sm space-y-5 text-center">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
            <Wallet className="w-7 h-7 text-primary" />
          </div>
          <h2 className="text-lg font-semibold text-foreground">Wallet Required</h2>
          <p className="text-sm text-muted-foreground">
            Connect your TON wallet to access this page.
          </p>
          <Button onClick={open} className="w-full">
            Connect Wallet
          </Button>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
};

export default RequireWallet;
