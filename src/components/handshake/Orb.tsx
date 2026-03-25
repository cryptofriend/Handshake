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
      border: '1px solid hsla(218, 86%, 55%, 0.2)',
      boxShadow: '0 0 20px hsla(218, 86%, 55%, 0.1)',
    }}
    initial={{ scale: 1.5, opacity: 0.5 }}
    animate={{ scale: 0.4, opacity: 0 }}
    transition={{ duration, delay, repeat: Infinity, ease: 'easeIn' }}
  />
);

/** A complete mini-orb used as each "daughter cell" during the mitosis animation */
const MiniOrb = ({ blobs }: { blobs: { color: string; size: number; dur: number; x: number; y: number }[] }) => (
  <div
    className="w-full h-full rounded-full overflow-hidden"
    style={{
      background: 'radial-gradient(circle at 30% 30%, hsla(218, 86%, 65%, 0.15), hsla(260, 70%, 50%, 0.1), hsla(200, 80%, 40%, 0.08))',
      backdropFilter: 'blur(40px)',
      border: '1px solid hsla(218, 86%, 55%, 0.15)',
      boxShadow: `
        0 0 60px hsla(218, 86%, 55%, 0.15),
        0 0 120px hsla(260, 70%, 50%, 0.08),
        inset 0 0 60px hsla(218, 86%, 55%, 0.05)
      `,
    }}
  >
    {blobs.map((b, i) => (
      <FloatingBlob key={i} color={b.color} size={b.size} duration={b.dur} delay={i * 0.4} x={b.x} y={b.y} />
    ))}
    <div
      className="absolute top-3 left-6 w-16 h-8 rounded-full"
      style={{ background: 'linear-gradient(135deg, hsla(0, 0%, 100%, 0.2), transparent)', filter: 'blur(8px)' }}
    />
  </div>
);

/**
 * Atomic orbital animation — a nucleus orb with two particles
 * (photon & electron) orbiting around it in elliptical paths,
 * like a miniature atom.
 */
const ORBIT_DURATION = 6;

const OrbitalIdleOrb = () => {
  // Nucleus gentle breathing
  const nucleusBreath = {
    scale: [1, 1.06, 1],
    opacity: [0.9, 1, 0.9],
  };

  // Orbital trail ring styling
  const trailStyle = (tilt: number) => ({
    width: 140,
    height: 140,
    border: '1px solid hsla(218, 86%, 55%, 0.08)',
    borderRadius: '50%',
    transform: `rotateX(${tilt}deg) rotateZ(20deg)`,
  });

  return (
    <div className="relative w-40 h-40 flex items-center justify-center" style={{ perspective: 400 }}>
      {/* Orbital trail rings (decorative) */}
      <div
        className="absolute pointer-events-none"
        style={{ ...trailStyle(65), transformStyle: 'preserve-3d' }}
      />
      <div
        className="absolute pointer-events-none"
        style={{ ...trailStyle(-65), transformStyle: 'preserve-3d', transform: 'rotateX(-65deg) rotateZ(-20deg)' }}
      />

      {/* Nucleus — central glowing orb */}
      <motion.div
        className="absolute w-24 h-24 rounded-full overflow-hidden"
        style={{
          background: 'radial-gradient(circle at 35% 35%, hsla(218, 86%, 65%, 0.2), hsla(260, 70%, 50%, 0.12), hsla(200, 80%, 40%, 0.08))',
          backdropFilter: 'blur(40px)',
          border: '1px solid hsla(218, 86%, 55%, 0.15)',
          boxShadow: `
            0 0 40px hsla(218, 86%, 55%, 0.2),
            0 0 80px hsla(260, 70%, 50%, 0.1),
            inset 0 0 40px hsla(218, 86%, 55%, 0.05)
          `,
        }}
        animate={nucleusBreath}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      >
        <FloatingBlob color="hsla(218, 90%, 60%, 0.5)" size={50} duration={4} delay={0} x={10} y={8} />
        <FloatingBlob color="hsla(260, 80%, 55%, 0.4)" size={40} duration={5} delay={0.3} x={-12} y={10} />
        <FloatingBlob color="hsla(190, 90%, 50%, 0.3)" size={35} duration={3.5} delay={0.6} x={8} y={-10} />
        <div
          className="absolute top-2 left-4 w-10 h-5 rounded-full"
          style={{ background: 'linear-gradient(135deg, hsla(0, 0%, 100%, 0.25), transparent)', filter: 'blur(6px)' }}
        />
      </motion.div>

      {/* Electron — blue particle orbiting on one ellipse */}
      <motion.div
        className="absolute"
        style={{ width: 16, height: 16 }}
        animate={{
          x: [70, 0, -70, 0, 70],
          y: [0, -35, 0, 35, 0],
        }}
        transition={{
          duration: ORBIT_DURATION,
          repeat: Infinity,
          ease: 'linear',
        }}
      >
        <div
          className="w-full h-full rounded-full"
          style={{
            background: 'radial-gradient(circle, hsla(218, 90%, 70%, 0.9), hsla(218, 86%, 55%, 0.6))',
            boxShadow: '0 0 12px hsla(218, 90%, 60%, 0.6), 0 0 24px hsla(218, 86%, 55%, 0.3)',
          }}
        />
        {/* Electron trail */}
        <motion.div
          className="absolute top-0 left-0 w-full h-full rounded-full"
          style={{
            background: 'radial-gradient(circle, hsla(218, 90%, 70%, 0.4), transparent)',
            filter: 'blur(4px)',
          }}
          animate={{ scale: [1, 1.8, 1], opacity: [0.5, 0.2, 0.5] }}
          transition={{ duration: 0.8, repeat: Infinity, ease: 'easeInOut' }}
        />
      </motion.div>

      {/* Photon — warm gold particle orbiting on opposite ellipse */}
      <motion.div
        className="absolute"
        style={{ width: 12, height: 12 }}
        animate={{
          x: [-60, 0, 60, 0, -60],
          y: [0, 40, 0, -40, 0],
        }}
        transition={{
          duration: ORBIT_DURATION * 0.75,
          repeat: Infinity,
          ease: 'linear',
        }}
      >
        <div
          className="w-full h-full rounded-full"
          style={{
            background: 'radial-gradient(circle, hsla(45, 95%, 70%, 0.9), hsla(30, 90%, 55%, 0.6))',
            boxShadow: '0 0 10px hsla(45, 95%, 65%, 0.6), 0 0 20px hsla(30, 90%, 50%, 0.3)',
          }}
        />
        {/* Photon trail */}
        <motion.div
          className="absolute top-0 left-0 w-full h-full rounded-full"
          style={{
            background: 'radial-gradient(circle, hsla(45, 95%, 70%, 0.4), transparent)',
            filter: 'blur(3px)',
          }}
          animate={{ scale: [1, 2, 1], opacity: [0.6, 0.15, 0.6] }}
          transition={{ duration: 0.6, repeat: Infinity, ease: 'easeInOut' }}
        />
      </motion.div>

      {/* Ambient glow behind everything */}
      <motion.div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: 180,
          height: 180,
          background: 'radial-gradient(circle, hsla(218, 86%, 55%, 0.06), transparent 70%)',
          filter: 'blur(15px)',
        }}
        animate={{ scale: [1, 1.1, 1], opacity: [0.4, 0.6, 0.4] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  );
};

export const Orb = ({ state, onClick }: OrbProps) => {
  const isActive = state === 'recording';
  const isProcessing = state === 'processing';
  const isIdle = state === 'idle';

  return (
    <div className="relative flex items-center justify-center w-56 h-56 mx-auto cursor-pointer" onClick={onClick}>
      {/* Outer ambient glow */}
      <motion.div
        className="absolute inset-[-50px] rounded-full"
        style={{
          background: 'radial-gradient(circle, hsla(218, 86%, 55%, 0.15), hsla(260, 80%, 60%, 0.08), transparent 70%)',
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

      {isIdle ? (
        <CollisionIdleOrb />
      ) : (
        /* Non-idle: original single orb */
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
            isActive
              ? { scale: [1, 1.08, 0.97, 1] }
              : isProcessing
              ? { scale: [1, 0.9, 1], rotate: [0, 180, 360] }
              : { scale: [1, 1.1, 0.95, 1] }
          }
          transition={{
            duration: isActive ? 1.2 : isProcessing ? 2 : 0.8,
            repeat: state === 'done' ? 0 : Infinity,
            ease: 'easeInOut',
          }}
        >
          <FloatingBlob color="hsla(218, 90%, 60%, 0.5)" size={80} duration={5} delay={0} x={20} y={15} />
          <FloatingBlob color="hsla(260, 80%, 55%, 0.4)" size={70} duration={6.5} delay={0.5} x={-25} y={20} />
          <FloatingBlob color="hsla(190, 90%, 50%, 0.35)" size={60} duration={4.5} delay={1} x={15} y={-20} />
          <FloatingBlob color="hsla(300, 60%, 55%, 0.25)" size={50} duration={7} delay={1.5} x={-18} y={-15} />
          <div
            className="absolute top-3 left-6 w-16 h-8 rounded-full"
            style={{
              background: 'linear-gradient(135deg, hsla(0, 0%, 100%, 0.2), transparent)',
              filter: 'blur(8px)',
            }}
          />
        </motion.div>
      )}

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