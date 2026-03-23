import { useState } from 'react';
import { motion } from 'framer-motion';
import { AgreementCard } from '@/components/handshake/AgreementCard';
import { useAppStore } from '@/store/appStore';
import { useNavigate } from 'react-router-dom';
import { Check, ArrowLeft, PenTool, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Agreement } from '@/types/agreement';

const CounterpartyPage = () => {
  const [confirmed, setConfirmed] = useState(false);
  const [signed, setSigned] = useState(false);
  const navigate = useNavigate();
  const agreement = useAppStore((s) => s.currentAgreement);
  const signAsCounterparty = useAppStore((s) => s.signAsCounterparty);

  // Mock agreement for demo if none exists
  const mockAgreement: Agreement = agreement || {
    id: 'demo',
    creatorName: 'Booga',
    counterpartyName: 'John',
    task: 'Design landing page with responsive layout',
    payment: '$500',
    deadline: 'Friday',
    notes: 'Deliver Figma file and mobile version',
    creatorSigned: true,
    counterpartySigned: false,
    creatorSignedAt: new Date().toISOString(),
    status: 'signed_by_one',
    createdAt: new Date().toISOString(),
  };

  const handleSign = () => {
    if (agreement) signAsCounterparty();
    setSigned(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="flex items-center gap-3 px-5 pt-5 pb-2">
        <button onClick={() => navigate('/')} className="p-2 -ml-2 rounded-xl hover:bg-muted transition-colors">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <h1 className="text-lg font-semibold text-foreground">Review Agreement</h1>
      </div>

      <div className="px-5 pb-10 max-w-md mx-auto mt-4">
        <AgreementCard agreement={signed ? { ...mockAgreement, counterpartySigned: true, status: 'fully_signed', counterpartySignedAt: new Date().toISOString() } : mockAgreement} />

        {!signed ? (
          <motion.div className="mt-6" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
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

            <div className="flex flex-col gap-3 mt-4">
              <Button
                disabled={!confirmed}
                onClick={handleSign}
                className="w-full rounded-2xl h-14 text-base font-semibold gap-2"
              >
                <PenTool className="w-4 h-4" />
                Sign Agreement
              </Button>
              <Button variant="outline" className="w-full rounded-2xl h-12 text-base gap-2 text-destructive border-destructive/20 hover:bg-destructive/5">
                <X className="w-4 h-4" />
                Reject
              </Button>
            </div>
          </motion.div>
        ) : (
          <motion.div className="mt-6 card-handshake text-center" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <motion.div
              className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', damping: 15, stiffness: 200, delay: 0.2 }}
            >
              <Check className="w-8 h-8 text-success" />
            </motion.div>
            <h3 className="text-lg font-semibold text-foreground mb-1">Fully Signed 🤝</h3>
            <p className="text-sm text-muted-foreground">
              Both parties have signed this agreement.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default CounterpartyPage;
