import { motion } from 'framer-motion';
import { useAppStore } from '@/store/appStore';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { LogOut, FileCheck, CheckCircle, AlertTriangle, Inbox, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AgreementCard } from '@/components/handshake/AgreementCard';
import { useTonAddress, useTonConnectUI } from '@tonconnect/ui-react';
import { useNavigate } from 'react-router-dom';

const ProfilePage = () => {
  const agreements = useAppStore((s) => s.agreements);
  const userAddress = useTonAddress();
  const [tonConnectUI] = useTonConnectUI();
  const navigate = useNavigate();

  const signed = agreements.filter((a) => a.status === 'fully_signed').length;
  const pending = agreements.filter((a) => a.status === 'signed_by_one').length;
  const signedAgreements = agreements.filter(
    (a) => a.status === 'fully_signed' || a.status === 'signed_by_one'
  );

  const handleLogout = async () => {
    await tonConnectUI.disconnect();
    navigate('/');
  };

  const shortAddress = userAddress
    ? `${userAddress.slice(0, 6)}...${userAddress.slice(-4)}`
    : '';

  return (
    <div className="min-h-screen bg-background px-6 pt-12 pb-24">
      <motion.div
        className="max-w-md mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Profile header */}
        <div className="flex flex-col items-center text-center mb-8">
          <Avatar className="w-20 h-20 mb-4 ring-2 ring-primary/20">
            <AvatarFallback className="bg-primary/10 text-primary text-xl font-semibold">
              <Wallet className="w-8 h-8" />
            </AvatarFallback>
          </Avatar>
          <h2 className="text-lg font-semibold text-foreground font-mono">{shortAddress}</h2>
          <p className="text-muted-foreground text-xs mt-1">TON Wallet</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          <div className="bg-card rounded-2xl p-4 text-center shadow-sm border border-border">
            <FileCheck className="w-5 h-5 mx-auto mb-1 text-primary" />
            <p className="text-lg font-semibold text-foreground">{agreements.length}</p>
            <p className="text-[11px] text-muted-foreground">Total</p>
          </div>
          <div className="bg-card rounded-2xl p-4 text-center shadow-sm border border-border">
            <CheckCircle className="w-5 h-5 mx-auto mb-1 text-success" />
            <p className="text-lg font-semibold text-foreground">{signed}</p>
            <p className="text-[11px] text-muted-foreground">Signed</p>
          </div>
          <div className="bg-card rounded-2xl p-4 text-center shadow-sm border border-border">
            <AlertTriangle className="w-5 h-5 mx-auto mb-1 text-warning" />
            <p className="text-lg font-semibold text-foreground">{pending}</p>
            <p className="text-[11px] text-muted-foreground">Pending</p>
          </div>
        </div>

        {/* Signed Documents */}
        <div className="mb-8">
          <h3 className="text-sm font-semibold text-foreground mb-4">Signed Documents</h3>
          {signedAgreements.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mb-3">
                <Inbox className="w-7 h-7 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">No signed documents yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {signedAgreements.map((agreement, i) => (
                <motion.div
                  key={agreement.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                >
                  <AgreementCard agreement={agreement} />
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Logout */}
        <Button
          variant="outline"
          className="w-full h-12 rounded-2xl gap-2 text-destructive border-destructive/20 hover:bg-destructive/5"
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4" />
          Disconnect Wallet
        </Button>
      </motion.div>
    </div>
  );
};

export default ProfilePage;
