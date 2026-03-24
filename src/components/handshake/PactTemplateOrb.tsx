import { motion } from 'framer-motion';

interface PactTemplateOrbProps {
  label: string;
  color: string;
  onClick: () => void;
}

export const PactTemplateOrb = ({ label, color, onClick }: PactTemplateOrbProps) => (
  <motion.button
    onClick={onClick}
    className="flex flex-col items-center gap-2 group"
    whileHover={{ scale: 1.08 }}
    whileTap={{ scale: 0.95 }}
  >
    <div
      className="relative w-20 h-20 rounded-full overflow-hidden"
      style={{
        background: `radial-gradient(circle at 30% 30%, ${color}33, ${color}1a, transparent)`,
        backdropFilter: 'blur(20px)',
        border: `1px solid ${color}30`,
        boxShadow: `0 0 30px ${color}20, inset 0 0 20px ${color}08`,
      }}
    >
      {/* Internal blob */}
      <motion.div
        className="absolute rounded-full blur-xl"
        style={{
          width: 40,
          height: 40,
          background: `${color}55`,
          left: '50%',
          top: '50%',
          marginLeft: -20,
          marginTop: -20,
        }}
        animate={{
          x: [5, -8, 5],
          y: [3, -5, 3],
          scale: [1, 1.3, 1],
          opacity: [0.4, 0.7, 0.4],
        }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      />
      {/* Glass highlight */}
      <div
        className="absolute top-2 left-3 w-8 h-4 rounded-full"
        style={{
          background: 'linear-gradient(135deg, hsla(0,0%,100%,0.2), transparent)',
          filter: 'blur(4px)',
        }}
      />
    </div>
    <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">
      {label}
    </span>
  </motion.button>
);
