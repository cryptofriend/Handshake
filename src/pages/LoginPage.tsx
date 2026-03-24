import { motion } from 'framer-motion';
import { Orb } from '@/components/handshake/Orb';
import { useAppStore } from '@/store/appStore';
import { useNavigate } from 'react-router-dom';
import { TonConnectButton, useTonConnectUI, useTonAddress } from '@tonconnect/ui-react';
import { useEffect } from 'react';

const LoginPage = () => {
  const setUser = useAppStore((s) => s.setUser);
  const navigate = useNavigate();
  const address = useTonAddress();
  const [tonConnectUI] = useTonConnectUI();

  useEffect(() => {
    if (address) {
      const shortAddr = `${address.slice(0, 4)}...${address.slice(-4)}`;
      setUser({
        id: address,
        name: shortAddr,
        username: shortAddr,
        avatar: undefined,
      });
      navigate('/create');
    }
  }, [address, setUser, navigate]);

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
        
        {/* Headline */}
        <p className="text-lg font-medium text-foreground/80 mb-1">
          Agreements in the Age of AI
        </p>
        
        <p className="text-muted-foreground text-sm mb-10">
          Turn voice into agreements
        </p>

        {/* TON Connect */}
        <TonConnectButton />
      </motion.div>
    </div>
  );
};

export default LoginPage;
