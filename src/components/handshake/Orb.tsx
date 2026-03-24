import { motion, AnimatePresence } from 'framer-motion';

type OrbState = 'idle' | 'recording' | 'processing' | 'done';

interface OrbProps {
  state: OrbState;
  onClick?: () => void;
}

const FloatingBlob = ({ color, size, duration, delay, x, y }: {
  color: string; size: number; duration: number; delay: number; x: number; y: number;
}) => (
  <motion.div
    className="absolute rounded-full blur-2xl"
    style={{
      width: size,
      height: size,
      background: color,
      left: '50%',
      top: '50%',
      marginLeft: -size / 2,
      marginTop: -size / 2,
    }}
    animate={{
      x: [x, -x * 0.7, x * 0.5, -x],
      y: [y, y * 0.6, -y * 0.8, y],
      scale: [1, 1.3, 0.8, 1.1, 1],
      opacity: [0.4, 0.7, 0.3, 0.6, 0.4],
    }}
    transition={{ duration, delay, repeat: Infinity, ease: 'easeInOut' }}
  />
);

const WaveRing = ({ delay, duration }: { delay: number; duration: number }) => (
  <motion.div
    className="absolute inset-0 rounded-full"
    style={{
    border: '1px solid hsla(45, 95%, 55%, 0.2)',
    boxShadow: '0 0 20px hsla(45, 95%, 55%, 0.1)',
    }}
    initial={{ scale: 1.5, opacity: 0.5 }}
    animate={{ scale: 0.4, opacity: 0 }}
    transition={{ duration, delay, repeat: Infinity, ease: 'easeIn' }}
  />
);

export const Orb = ({ state, onClick }: OrbProps) => {
  const isActive = state === 'recording';
  const isProcessing = state === 'processing';

  return (
    <div className="relative flex items-center justify-center w-56 h-56 mx-auto cursor-pointer" onClick={onClick}>
      {/* Outer ambient glow */}
      <motion.div
        className="absolute inset-[-50px] rounded-full"
        style={{
          background: 'radial-gradient(circle, hsla(45, 95%, 55%, 0.15), hsla(35, 90%, 50%, 0.08), transparent 70%)',
          filter: 'blur(20px)',
        }}
        animate={{
          scale: isActive ? [1, 1.3, 1] : isProcessing ? [1, 0.9, 1] : [1, 1.08, 1],
          opacity: isActive ? [0.6, 1, 0.6] : [0.3, 0.5, 0.3],
        }}
        transition={{ duration: isActive ? 1 : 4, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Wave rings for recording */}
      <AnimatePresence>
        {isActive && (
          <>
            <WaveRing delay={0} duration={1.5} />
            <WaveRing delay={0.5} duration={1.5} />
            <WaveRing delay={1} duration={1.5} />
          </>
        )}
      </AnimatePresence>

      {/* Main orb container - glass morphism */}
      <motion.div
        className="relative w-40 h-40 rounded-full overflow-hidden"
        style={{
          background: 'radial-gradient(circle at 30% 30%, hsla(218, 86%, 65%, 0.15), hsla(260, 70%, 50%, 0.1), hsla(200, 80%, 40%, 0.08))',
          backdropFilter: 'blur(40px)',
          border: '1px solid hsla(218, 86%, 55%, 0.15)',
          boxShadow: `
            0 0 60px hsla(218, 86%, 55%, ${isActive ? 0.35 : 0.15}),
            0 0 120px hsla(260, 70%, 50%, ${isActive ? 0.2 : 0.08}),
            inset 0 0 60px hsla(218, 86%, 55%, 0.05)
          `,
        }}
        animate={
          state === 'idle'
            ? { scale: [1, 1.03, 1] }
            : isActive
            ? { scale: [1, 1.08, 0.97, 1] }
            : isProcessing
            ? { scale: [1, 0.9, 1], rotate: [0, 180, 360] }
            : { scale: [1, 1.1, 0.95, 1] }
        }
        transition={{
          duration: state === 'idle' ? 4 : isActive ? 1.2 : isProcessing ? 2 : 0.8,
          repeat: state === 'done' ? 0 : Infinity,
          ease: 'easeInOut',
        }}
      >
        {/* Floating color blobs inside */}
        <FloatingBlob color="hsla(218, 90%, 60%, 0.5)" size={80} duration={5} delay={0} x={20} y={15} />
        <FloatingBlob color="hsla(260, 80%, 55%, 0.4)" size={70} duration={6.5} delay={0.5} x={-25} y={20} />
        <FloatingBlob color="hsla(190, 90%, 50%, 0.35)" size={60} duration={4.5} delay={1} x={15} y={-20} />
        <FloatingBlob color="hsla(300, 60%, 55%, 0.25)" size={50} duration={7} delay={1.5} x={-18} y={-15} />

        {/* Glass highlight */}
        <div
          className="absolute top-3 left-6 w-16 h-8 rounded-full"
          style={{
            background: 'linear-gradient(135deg, hsla(0, 0%, 100%, 0.2), transparent)',
            filter: 'blur(8px)',
          }}
        />
      </motion.div>

      {/* Processing spinner ring */}
      <AnimatePresence>
        {isProcessing && (
          <motion.div
            className="absolute inset-2 rounded-full"
            style={{
              border: '1.5px solid transparent',
              borderTopColor: 'hsla(218, 86%, 55%, 0.5)',
              borderBottomColor: 'hsla(260, 70%, 50%, 0.2)',
            }}
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
