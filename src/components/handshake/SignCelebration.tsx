import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { CheckCircle2, Share2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface Props {
  show: boolean;
  agreementTitle: string;
  txHash: string;
  onClose: () => void;
}

const fireConfetti = () => {
  const duration = 3000;
  const end = Date.now() + duration;

  const frame = () => {
    confetti({
      particleCount: 3,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.7 },
      colors: ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b'],
    });
    confetti({
      particleCount: 3,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.7 },
      colors: ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b'],
    });
    if (Date.now() < end) requestAnimationFrame(frame);
  };
  frame();

  // Big burst
  setTimeout(() => {
    confetti({
      particleCount: 100,
      spread: 100,
      origin: { x: 0.5, y: 0.4 },
      colors: ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b'],
    });
  }, 300);
};

export const SignCelebration = ({ show, agreementTitle, txHash, onClose }: Props) => {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!show) { setStep(0); return; }
    fireConfetti();
    const t1 = setTimeout(() => setStep(1), 600);
    const t2 = setTimeout(() => setStep(2), 1200);
    const t3 = setTimeout(() => setStep(3), 1800);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [show]);

  const handleShare = async () => {
    const shareData = {
      title: '🤝 Agreement Signed!',
      text: `I just signed "${agreementTitle}" on-chain with Handshake Monster!`,
      url: window.location.href,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(`${shareData.text}\n${shareData.url}`);
        toast.success('Link copied!');
      }
    } catch { /* cancelled */ }
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center px-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0"
            style={{ background: 'hsla(var(--background) / 0.85)', backdropFilter: 'blur(20px)' }}
            onClick={onClose}
          />

          {/* Content */}
          <motion.div
            className="relative z-10 w-full max-w-sm text-center"
            initial={{ scale: 0.8, y: 40 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.8, y: 40, opacity: 0 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          >
            {/* Animated seal */}
            <motion.div
              className="mx-auto w-24 h-24 rounded-full flex items-center justify-center mb-6"
              style={{
                background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--orb-purple)))',
                boxShadow: '0 0 60px hsl(var(--primary) / 0.4), 0 0 120px hsl(var(--orb-purple) / 0.2)',
              }}
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', damping: 12, stiffness: 200, delay: 0.2 }}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, type: 'spring', stiffness: 400 }}
              >
                <CheckCircle2 className="w-12 h-12 text-white" strokeWidth={2.5} />
              </motion.div>
            </motion.div>

            {/* Title */}
            <motion.h2
              className="text-2xl font-serif font-bold text-foreground mb-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: step >= 1 ? 1 : 0, y: step >= 1 ? 0 : 10 }}
              transition={{ duration: 0.4 }}
            >
              Deal Sealed! 🤝
            </motion.h2>

            <motion.p
              className="text-sm text-muted-foreground mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: step >= 2 ? 1 : 0 }}
              transition={{ duration: 0.4 }}
            >
              <span className="font-medium text-foreground">{agreementTitle}</span> is now
              signed on-chain.
            </motion.p>

            {/* Receipt preview */}
            <motion.div
              className="rounded-2xl p-4 mb-6"
              style={{
                background: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
              }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: step >= 2 ? 1 : 0, y: step >= 2 ? 0 : 10 }}
              transition={{ duration: 0.4 }}
            >
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
                Transaction Proof
              </p>
              <p className="font-mono text-xs text-foreground/80 break-all">{txHash}</p>
            </motion.div>

            {/* Actions */}
            <motion.div
              className="flex gap-3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: step >= 3 ? 1 : 0, y: step >= 3 ? 0 : 10 }}
              transition={{ duration: 0.4 }}
            >
              <Button
                variant="outline"
                className="flex-1 rounded-xl h-12 gap-2"
                onClick={handleShare}
              >
                <Share2 className="w-4 h-4" />
                Share
              </Button>
              <Button
                className="flex-1 rounded-xl h-12 gap-2"
                onClick={onClose}
              >
                <ExternalLink className="w-4 h-4" />
                View Agreement
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
