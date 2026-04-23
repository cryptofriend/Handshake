import { useState } from 'react';
import { useTonAddress } from '@tonconnect/ui-react';
import { Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAppStore } from '@/store/appStore';
import { LoginDialog } from './LoginDialog';

const RequireWallet = ({ children }: { children: React.ReactNode }) => {
  const tonAddress = useTonAddress();
  const authIdentity = useAppStore((s) => s.authIdentity);
  const [open, setOpen] = useState(false);

  // Authenticated if any method is set, OR if TON wallet is currently connected
  const authed = !!authIdentity || !!tonAddress;

  if (!authed) {
    return (
      <>
        <div className="min-h-screen bg-background flex items-center justify-center p-5">
          <Card className="p-8 w-full max-w-sm space-y-5 text-center">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <Wallet className="w-7 h-7 text-primary" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">Sign in required</h2>
            <p className="text-sm text-muted-foreground">
              Connect with TON, Solana, or World ID to access this page.
            </p>
            <Button onClick={() => setOpen(true)} className="w-full">
              Sign In
            </Button>
          </Card>
        </div>
        <LoginDialog open={open} onOpenChange={setOpen} />
      </>
    );
  }

  return <>{children}</>;
};

export default RequireWallet;
