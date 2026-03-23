import { motion } from 'framer-motion';
import { useAppStore } from '@/store/appStore';
import { TelegramLoginButton, TelegramUser } from '@/components/handshake/TelegramLoginButton';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { LogOut, FileCheck, CheckCircle, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Orb } from '@/components/handshake/Orb';

const ProfilePage = () => {
  const user = useAppStore((s) => s.user);
  const setUser = useAppStore((s) => s.setUser);
  const agreements = useAppStore((s) => s.agreements);

  const handleTelegramAuth = (tgUser: TelegramUser) => {
    setUser({
      id: String(tgUser.id),
      name: tgUser.first_name + (tgUser.last_name ? ` ${tgUser.last_name}` : ''),
      username: tgUser.username || tgUser.first_name,
      avatar: tgUser.photo_url,
    });
  };

  const handleLogout = () => {
    setUser(null);
  };

  const signed = agreements.filter((a) => a.status === 'fully_signed').length;
  const pending = agreements.filter((a) => a.status === 'signed_by_one').length;

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 pb-20">
        <motion.div
          className="w-full max-w-sm flex flex-col items-center text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="mb-4 scale-75 opacity-80">
            <Orb state="idle" />
          </div>

          <h1 className="logo-text text-3xl text-foreground mb-2">Sign in</h1>
          <p className="text-muted-foreground text-sm mb-8">
            Connect your Telegram to create and sign agreements
          </p>

          <TelegramLoginButton
            botName="handshakemonsterbot"
            onAuth={handleTelegramAuth}
          />

          <p className="trust-text mt-6 text-muted-foreground text-xs">
            Private. Encrypted. Simple.
          </p>
        </motion.div>
      </div>
    );
  }

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
            {user.avatar ? (
              <AvatarImage src={user.avatar} alt={user.name} />
            ) : null}
            <AvatarFallback className="bg-primary/10 text-primary text-xl font-semibold">
              {user.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <h2 className="text-xl font-semibold text-foreground">{user.name}</h2>
          <p className="text-muted-foreground text-sm">@{user.username}</p>
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

        {/* Logout */}
        <Button
          variant="outline"
          className="w-full h-12 rounded-2xl gap-2"
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </Button>
      </motion.div>
    </div>
  );
};

export default ProfilePage;
