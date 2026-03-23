import { motion } from 'framer-motion';
import { Orb } from '@/components/handshake/Orb';
import { Send, Shield } from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const setUser = useAppStore((s) => s.setUser);
  const navigate = useNavigate();

  const handleLogin = () => {
    // Mock Telegram login
    setUser({
      id: '1',
      name: 'Booga',
      username: 'booga',
      avatar: undefined,
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

        {/* CTA */}
        <motion.button
          onClick={handleLogin}
          className="btn-handshake w-full flex items-center justify-center gap-3 bg-primary text-primary-foreground h-14 text-base font-semibold px-8"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Send className="w-5 h-5" />
          Continue with Telegram
        </motion.button>

        {/* Trust note */}
        <div className="flex items-center gap-2 mt-6">
          <Shield className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="trust-text">Private. Encrypted. Simple.</span>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
