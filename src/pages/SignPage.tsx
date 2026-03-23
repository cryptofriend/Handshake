import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/store/appStore';
import { AgreementCard } from '@/components/handshake/AgreementCard';
import { useNavigate } from 'react-router-dom';
import { Check, ArrowLeft, Share2, Copy, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';

const SignPage = () => {
  const [confirmed, setConfirmed] = useState(false);
  const [signed, setSigned] = useState(false);
  const navigate = useNavigate();
  const agreement = useAppStore((s) => s.currentAgreement);
  const signAsCreator = useAppStore((s) => s.signAsCreator);

  if (!agreement) {
    navigate('/create');
    return null;
  }

  const handleSign = () => {
    signAsCreator();
    setSigned(true);
  };

  const handleShare = () => {
    const url = `${window.location.origin}/agreement/${agreement.id}`;
    if (navigator.share) {
      navigator.share({
        title: 'Handshake Agreement',
        text: `${agreement.creatorName} sent you an agreement to review and sign on Handshake 🤝`,
        url,
      }).catch(() => {});
    } else {
      handleCopy();
    }
  };

  const handleCopy = () => {
    const url = `${window.location.origin}/agreement/${agreement.id}`;
    navigator.clipboard.writeText(url);
    toast.success('Link copied to clipboard');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 pt-5 pb-2">
        <button
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 rounded-xl hover:bg-muted transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <h1 className="text-lg font-semibold text-foreground">
          {signed ? 'Agreement Signed' : 'Sign Agreement'}
        </h1>
      </div>

      <div className="px-5 pb-10 max-w-md mx-auto">
        <div className="mt-4">
          <AgreementCard agreement={agreement} />
        </div>

        <AnimatePresence mode="wait">
          {!signed ? (
            <motion.div
              key="sign"
              className="mt-6"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <label className="flex items-start gap-3 cursor-pointer p-4 rounded-2xl border border-border bg-card">
                <Checkbox
                  checked={confirmed}
                  onCheckedChange={(v) => setConfirmed(v as boolean)}
                  className="mt-0.5"
                />
                <span className="text-sm text-foreground">
                  I confirm this agreement is accurate and I agree to its terms.
                </span>
              </label>

              <Button
                disabled={!confirmed}
                onClick={handleSign}
                className="w-full rounded-2xl h-14 text-base font-semibold mt-4 gap-2"
              >
                <Send className="w-4 h-4" />
                Sign with Telegram
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="signed"
              className="mt-6"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {/* Success state */}
              <div className="card-handshake text-center mb-6">
                <motion.div
                  className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', damping: 15, stiffness: 200, delay: 0.2 }}
                >
                  <Check className="w-8 h-8 text-success" />
                </motion.div>
                <h3 className="text-lg font-semibold text-foreground mb-1">Agreement Signed ✓</h3>
                <p className="text-sm text-muted-foreground mb-1">
                  {new Date().toLocaleString()}
                </p>
                <p className="text-xs text-primary font-medium">
                  Waiting for counterparty
                </p>
              </div>

              {/* Share actions */}
              <div className="flex flex-col gap-3">
                <Button
                  onClick={handleShare}
                  className="w-full rounded-2xl h-14 text-base font-semibold gap-2"
                >
                  <Share2 className="w-4 h-4" />
                  Share for Signature
                </Button>
                <Button
                  variant="outline"
                  onClick={handleCopy}
                  className="w-full rounded-2xl h-12 text-base gap-2"
                >
                  <Copy className="w-4 h-4" />
                  Copy Link
                </Button>
              </div>

              <p className="text-center trust-text mt-4">
                The other party can review and sign in one click.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SignPage;
