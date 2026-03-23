import { motion, AnimatePresence } from 'framer-motion';

type OrbState = 'idle' | 'recording' | 'processing' | 'done';

interface OrbProps {
  state: OrbState;
  onClick?: () => void;
}

const WaveRing = ({ delay, duration }: { delay: number; duration: number }) => (
  <motion.div
    className="absolute inset-0 rounded-full border-2 border-primary/30"
    initial={{ scale: 1.5, opacity: 0.6 }}
    animate={{ scale: 0.5, opacity: 0 }}
    transition={{ duration, delay, repeat: Infinity, ease: 'easeIn' }}
  />
);

export const Orb = ({ state, onClick }: OrbProps) => {
  return (
    <div className="relative flex items-center justify-center w-56 h-56 mx-auto cursor-pointer" onClick={onClick}>
      {/* Background glow */}
      <motion.div
        className="absolute inset-[-40px] rounded-full"
        style={{ background: 'var(--gradient-glow)' }}
        animate={{
          scale: state === 'recording' ? [1, 1.2, 1] : state === 'processing' ? [1, 0.9, 1] : [1, 1.05, 1],
          opacity: state === 'recording' ? [0.5, 0.8, 0.5] : [0.3, 0.5, 0.3],
        }}
        transition={{ duration: state === 'recording' ? 1 : 4, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Incoming wave rings (recording) */}
      <AnimatePresence>
        {state === 'recording' && (
          <>
            <WaveRing delay={0} duration={1.5} />
            <WaveRing delay={0.5} duration={1.5} />
            <WaveRing delay={1} duration={1.5} />
          </>
        )}
      </AnimatePresence>

      {/* Main orb */}
      <motion.div
        className={`relative w-40 h-40 rounded-full ${
          state === 'recording' ? 'orb-glow-intense' : 'orb-glow'
        }`}
        style={{ background: 'var(--gradient-orb)' }}
        animate={
          state === 'idle'
            ? { scale: [1, 1.05, 1] }
            : state === 'recording'
            ? { scale: [1, 1.1, 0.95, 1] }
            : state === 'processing'
            ? { scale: [1, 0.85, 1], rotate: [0, 180, 360] }
            : { scale: [1, 1.15, 0.9, 1] }
        }
        transition={{
          duration: state === 'idle' ? 4 : state === 'recording' ? 1.2 : state === 'processing' ? 2 : 0.8,
          repeat: state === 'done' ? 0 : Infinity,
          ease: 'easeInOut',
        }}
      >
        {/* Inner shine */}
        <div className="absolute inset-4 rounded-full bg-primary/20 blur-xl" />
        <div className="absolute top-6 left-8 w-8 h-8 rounded-full bg-primary-foreground/20 blur-md" />
      </motion.div>

      {/* Processing spinner ring */}
      <AnimatePresence>
        {state === 'processing' && (
          <motion.div
            className="absolute inset-2 rounded-full border-2 border-t-primary border-r-transparent border-b-primary/30 border-l-transparent"
            initial={{ opacity: 0, rotate: 0 }}
            animate={{ opacity: 1, rotate: 360 }}
            exit={{ opacity: 0 }}
            transition={{ rotate: { duration: 1.5, repeat: Infinity, ease: 'linear' }, opacity: { duration: 0.3 } }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
