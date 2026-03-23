import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Orb } from '@/components/handshake/Orb';
import { AgreementCard } from '@/components/handshake/AgreementCard';
import { EditAgreementModal } from '@/components/handshake/EditAgreementModal';
import { useAppStore } from '@/store/appStore';
import { useNavigate } from 'react-router-dom';
import { Agreement } from '@/types/agreement';
import { Mic, Square, Pencil, PenTool, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

type FlowState = 'idle' | 'recording' | 'processing' | 'result';

const MOCK_AGREEMENT: Omit<Agreement, 'id' | 'creatorName' | 'createdAt' | 'creatorSigned' | 'counterpartySigned' | 'status'> = {
  counterpartyName: 'John',
  task: 'Design landing page with responsive layout',
  payment: '$500',
  deadline: 'Friday',
  notes: 'Deliver Figma file and mobile version',
};

const CreateAgreementPage = () => {
  const [flowState, setFlowState] = useState<FlowState>('idle');
  const [seconds, setSeconds] = useState(0);
  const [editOpen, setEditOpen] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const navigate = useNavigate();

  const user = useAppStore((s) => s.user);
  const currentAgreement = useAppStore((s) => s.currentAgreement);
  const setCurrentAgreement = useAppStore((s) => s.setCurrentAgreement);
  const updateAgreement = useAppStore((s) => s.updateAgreement);
  const addAgreement = useAppStore((s) => s.addAgreement);

  const startRecording = useCallback(() => {
    setFlowState('recording');
    setSeconds(0);
    timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
  }, []);

  const stopRecording = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setFlowState('processing');

    // Simulate AI processing
    setTimeout(() => {
      const agreement: Agreement = {
        id: crypto.randomUUID(),
        creatorName: user?.name || 'You',
        ...MOCK_AGREEMENT,
        creatorSigned: false,
        counterpartySigned: false,
        status: 'draft',
        createdAt: new Date().toISOString(),
      };
      setCurrentAgreement(agreement);
      addAgreement(agreement);
      setFlowState('result');
    }, 3000);
  }, [user, setCurrentAgreement, addAgreement]);

  const handleSign = () => {
    navigate('/sign');
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-2">
        <h1 className="logo-text text-2xl text-foreground">Handshake</h1>
        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
          <User className="w-4 h-4 text-primary" />
        </div>
      </div>

      <div className="px-5 pb-10 max-w-md mx-auto">
        <AnimatePresence mode="wait">
          {flowState !== 'result' ? (
            <motion.div
              key="record"
              className="flex flex-col items-center pt-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {/* Helper text */}
              <motion.div
                className="text-center mb-8"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h2 className="text-xl font-semibold text-foreground mb-1">
                  {flowState === 'processing' ? 'Crafting your agreement...' : 'Record your agreement'}
                </h2>
                {flowState === 'idle' && (
                  <p className="text-sm text-muted-foreground">
                    Say it naturally. We'll structure it.
                  </p>
                )}
                {flowState === 'recording' && (
                  <p className="text-sm text-primary font-medium tabular-nums">{formatTime(seconds)}</p>
                )}
              </motion.div>

              {/* Orb */}
              <Orb
                state={flowState === 'result' ? 'done' : flowState}
                onClick={flowState === 'idle' ? startRecording : undefined}
              />

              {/* Action button */}
              <div className="mt-8">
                {flowState === 'idle' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="flex flex-col items-center gap-4"
                  >
                    <Button
                      onClick={startRecording}
                      className="rounded-2xl h-14 px-10 text-base font-semibold gap-2"
                    >
                      <Mic className="w-5 h-5" />
                      Tap to Record
                    </Button>
                    <p className="text-xs text-muted-foreground text-center max-w-[260px]">
                      Example: "John will design a logo for $300 by Friday."
                    </p>
                  </motion.div>
                )}

                {flowState === 'recording' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <Button
                      onClick={stopRecording}
                      variant="destructive"
                      className="rounded-2xl h-14 px-10 text-base font-semibold gap-2"
                    >
                      <Square className="w-4 h-4" />
                      Stop Recording
                    </Button>
                  </motion.div>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="result"
              className="pt-6"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* Mini orb */}
              <div className="flex justify-center mb-4 scale-[0.35] h-20 -mt-4">
                <Orb state="done" />
              </div>

              {currentAgreement && (
                <>
                  <AgreementCard agreement={currentAgreement} />

                  <div className="flex flex-col gap-3 mt-6">
                    <Button
                      variant="outline"
                      onClick={() => setEditOpen(true)}
                      className="rounded-2xl h-12 text-base gap-2"
                    >
                      <Pencil className="w-4 h-4" />
                      Edit Agreement
                    </Button>
                    <Button
                      onClick={handleSign}
                      className="rounded-2xl h-12 text-base gap-2"
                    >
                      <PenTool className="w-4 h-4" />
                      Sign Agreement
                    </Button>
                  </div>

                  <EditAgreementModal
                    agreement={currentAgreement}
                    open={editOpen}
                    onClose={() => setEditOpen(false)}
                    onSave={(updates) => updateAgreement(updates)}
                  />
                </>
              )}

              <button
                onClick={() => {
                  setFlowState('idle');
                  setCurrentAgreement(null);
                }}
                className="w-full text-center text-sm text-muted-foreground mt-6 py-2 hover:text-foreground transition-colors"
              >
                Create another agreement
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CreateAgreementPage;
