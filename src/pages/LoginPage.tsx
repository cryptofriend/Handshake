import { motion } from 'framer-motion';
import { Orb } from '@/components/handshake/Orb';
import { Shield } from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import { useNavigate } from 'react-router-dom';
import { TelegramLoginButton, TelegramUser } from '@/components/handshake/TelegramLoginButton';

const LoginPage = () => {
  const setUser = useAppStore((s) => s.setUser);
  const navigate = useNavigate();

  const handleTelegramAuth = (tgUser: TelegramUser) => {
    setUser({
      id: String(tgUser.id),
      name: tgUser.first_name + (tgUser.last_name ? ` ${tgUser.last_name}` : ''),
      username: tgUser.username || tgUser.first_name,
      avatar: tgUser.photo_url,
    });
    navigate('/create');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
      <motion.div
        className="w-full max-w-sm flex flex-col items-center text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Orb background */}
        <div className="mb-4 scale-75 opacity-80">
          <Orb state="idle" />
        </div>

        {/* Logo */}
        <h1 className="logo-text text-4xl text-foreground mb-2">Handshake</h1>
        <p className="text-muted-foreground text-base mb-10">
          Turn voice into agreements
        </p>

        {/* Telegram Login Widget */}
        <TelegramLoginButton
          botName="handshakemonsterbot"
          onAuth={handleTelegramAuth}
        />

      </motion.div>
    </div>
  );
};

export default LoginPage;
