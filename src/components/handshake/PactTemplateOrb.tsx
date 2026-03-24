import { motion } from 'framer-motion';

interface PactTemplateOrbProps {
  label: string;
  colors: [string, string, string]; // three hsla accent colors
  onClick: () => void;
}

const MiniBlob = ({ color, size, duration, delay, x, y }: {
  color: string; size: number; duration: number; delay: number; x: number; y: number;
}) => (
  <motion.div
    className="absolute rounded-full blur-xl"
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
      x: [x, -x * 0.7, x],
      y: [y, y * 0.6, -y],
      scale: [1, 1.4, 0.9, 1],
      opacity: [0.5, 0.8, 0.3, 0.5],
    }}
    transition={{ duration, delay, repeat: Infinity, ease: 'easeInOut' }}
  />
);

export const PactTemplateOrb = ({ label, colors, onClick }: PactTemplateOrbProps) => (
  <motion.button
    onClick={onClick}
    className="flex flex-col items-center gap-2.5 group"
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.93 }}
  >
    <motion.div
      className="relative w-[72px] h-[72px] rounded-full overflow-hidden"
      style={{
        background: `radial-gradient(circle at 35% 35%, ${colors[0]}, ${colors[1]}, ${colors[2]})`,
        backdropFilter: 'blur(30px)',
        border: `1px solid hsla(0, 0%, 100%, 0.12)`,
        boxShadow: `0 0 40px ${colors[0]}, 0 0 80px ${colors[1]}, inset 0 0 30px ${colors[2]}`,
      }}
      animate={{ scale: [1, 1.04, 1] }}
      transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
    >
      <MiniBlob color={colors[0]} size={35} duration={4} delay={0} x={10} y={8} />
      <MiniBlob color={colors[1]} size={30} duration={5} delay={0.5} x={-12} y={10} />
      <MiniBlob color={colors[2]} size={25} duration={3.5} delay={1} x={8} y={-10} />

      {/* Glass highlight */}
      <div
        className="absolute top-1.5 left-3 w-7 h-3.5 rounded-full"
        style={{
          background: 'linear-gradient(135deg, hsla(0,0%,100%,0.25), transparent)',
          filter: 'blur(3px)',
        }}
      />
    </motion.div>
    <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">
      {label}
    </span>
  </motion.button>
);
