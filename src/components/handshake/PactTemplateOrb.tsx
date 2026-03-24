import { motion } from 'framer-motion';

interface PactTemplateOrbProps {
  label: string;
  colors: [string, string, string];
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

const ORB_SIZE = 72;
const ICON_TRANSITION = {
  duration: 6,
  repeat: Infinity,
  ease: 'easeInOut' as const,
  times: [0, 0.15, 0.35, 0.65, 0.85, 1],
};

/** Alignment: orb morphs into an upward arrow and back */
const AlignmentAnimation = ({ colors }: { colors: [string, string, string] }) => (
  <div className="relative w-full h-full">
    {/* Arrow shape emerging from within */}
    <motion.div
      className="absolute inset-0 flex items-center justify-center"
      animate={{
        opacity: [0, 0, 1, 1, 0, 0],
      }}
      transition={ICON_TRANSITION}
    >
      {/* Arrow shaft */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: 4,
          height: 24,
          background: colors[0].replace(/[\d.]+\)$/, '0.9)'),
          filter: 'blur(0.5px)',
        }}
        animate={{
          scaleY: [0, 0, 1, 1, 0, 0],
          y: [8, 8, 2, 2, 8, 8],
        }}
        transition={ICON_TRANSITION}
      />
      {/* Arrow head - left wing */}
      <motion.div
        className="absolute"
        style={{
          width: 14,
          height: 4,
          background: colors[0].replace(/[\d.]+\)$/, '0.9)'),
          borderRadius: 2,
          transformOrigin: 'right center',
          filter: 'blur(0.5px)',
        }}
        animate={{
          rotate: [0, 0, 45, 45, 0, 0],
          opacity: [0, 0, 1, 1, 0, 0],
          x: [-7, -7, -7, -7, -7, -7],
          y: [-8, -8, -8, -8, -8, -8],
        }}
        transition={ICON_TRANSITION}
      />
      {/* Arrow head - right wing */}
      <motion.div
        className="absolute"
        style={{
          width: 14,
          height: 4,
          background: colors[0].replace(/[\d.]+\)$/, '0.9)'),
          borderRadius: 2,
          transformOrigin: 'left center',
          filter: 'blur(0.5px)',
        }}
        animate={{
          rotate: [0, 0, -45, -45, 0, 0],
          opacity: [0, 0, 1, 1, 0, 0],
          x: [7, 7, 7, 7, 7, 7],
          y: [-8, -8, -8, -8, -8, -8],
        }}
        transition={ICON_TRANSITION}
      />
    </motion.div>
    {/* Orb fades as arrow appears */}
    <motion.div
      className="absolute inset-0 rounded-full overflow-hidden"
      animate={{
        opacity: [1, 1, 0.15, 0.15, 1, 1],
        scale: [1, 1, 0.7, 0.7, 1, 1],
      }}
      transition={ICON_TRANSITION}
    >
      <MiniBlob color={colors[0]} size={35} duration={4} delay={0} x={10} y={8} />
      <MiniBlob color={colors[1]} size={30} duration={5} delay={0.5} x={-12} y={10} />
      <MiniBlob color={colors[2]} size={25} duration={3.5} delay={1} x={8} y={-10} />
    </motion.div>
  </div>
);

/** Transparency: orb slowly disappears and reappears */
const TransparencyAnimation = ({ colors }: { colors: [string, string, string] }) => (
  <div className="relative w-full h-full">
    <motion.div
      className="absolute inset-0 rounded-full overflow-hidden"
      animate={{
        opacity: [1, 1, 0, 0, 1, 1],
        scale: [1, 1, 0.85, 0.85, 1, 1],
        filter: [
          'blur(0px)',
          'blur(0px)',
          'blur(12px)',
          'blur(12px)',
          'blur(0px)',
          'blur(0px)',
        ],
      }}
      transition={ICON_TRANSITION}
    >
      <MiniBlob color={colors[0]} size={35} duration={4} delay={0} x={10} y={8} />
      <MiniBlob color={colors[1]} size={30} duration={5} delay={0.5} x={-12} y={10} />
      <MiniBlob color={colors[2]} size={25} duration={3.5} delay={1} x={8} y={-10} />
    </motion.div>
    {/* Ghost outline visible when orb is invisible */}
    <motion.div
      className="absolute inset-[6px] rounded-full"
      style={{
        border: `1.5px dashed ${colors[0].replace(/[\d.]+\)$/, '0.4)')}`,
      }}
      animate={{
        opacity: [0, 0, 0.8, 0.8, 0, 0],
        scale: [0.9, 0.9, 1, 1, 0.9, 0.9],
      }}
      transition={ICON_TRANSITION}
    />
  </div>
);

/** Sovereignty: orb morphs into a raised fist and back */
const SovereigntyAnimation = ({ colors }: { colors: [string, string, string] }) => (
  <div className="relative w-full h-full">
    {/* Fist shape */}
    <motion.div
      className="absolute inset-0 flex items-center justify-center"
      animate={{
        opacity: [0, 0, 1, 1, 0, 0],
      }}
      transition={ICON_TRANSITION}
    >
      {/* Fist body (palm) */}
      <motion.div
        className="absolute rounded-md"
        style={{
          width: 20,
          height: 22,
          background: colors[0].replace(/[\d.]+\)$/, '0.85)'),
          filter: 'blur(0.5px)',
          borderRadius: '5px 5px 4px 4px',
        }}
        animate={{
          scaleY: [0, 0, 1, 1, 0, 0],
          y: [4, 4, 2, 2, 4, 4],
        }}
        transition={ICON_TRANSITION}
      />
      {/* Thumb */}
      <motion.div
        className="absolute"
        style={{
          width: 8,
          height: 10,
          background: colors[0].replace(/[\d.]+\)$/, '0.75)'),
          borderRadius: '3px',
          filter: 'blur(0.5px)',
        }}
        animate={{
          opacity: [0, 0, 1, 1, 0, 0],
          x: [-14, -14, -14, -14, -14, -14],
          y: [2, 2, 2, 2, 2, 2],
        }}
        transition={ICON_TRANSITION}
      />
      {/* Knuckle lines */}
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{
            width: 16,
            height: 1.5,
            background: colors[2].replace(/[\d.]+\)$/, '0.5)'),
            borderRadius: 1,
          }}
          animate={{
            opacity: [0, 0, 0.7, 0.7, 0, 0],
            y: [-5 + i * 7, -5 + i * 7, -5 + i * 7, -5 + i * 7, -5 + i * 7, -5 + i * 7],
          }}
          transition={ICON_TRANSITION}
        />
      ))}
      {/* Wrist */}
      <motion.div
        className="absolute"
        style={{
          width: 16,
          height: 8,
          background: colors[1].replace(/[\d.]+\)$/, '0.6)'),
          borderRadius: '0 0 4px 4px',
          filter: 'blur(0.5px)',
        }}
        animate={{
          opacity: [0, 0, 1, 1, 0, 0],
          y: [16, 16, 16, 16, 16, 16],
        }}
        transition={ICON_TRANSITION}
      />
    </motion.div>
    {/* Orb fades as fist appears */}
    <motion.div
      className="absolute inset-0 rounded-full overflow-hidden"
      animate={{
        opacity: [1, 1, 0.15, 0.15, 1, 1],
        scale: [1, 1, 0.7, 0.7, 1, 1],
      }}
      transition={ICON_TRANSITION}
    >
      <MiniBlob color={colors[0]} size={35} duration={4} delay={0} x={10} y={8} />
      <MiniBlob color={colors[1]} size={30} duration={5} delay={0.5} x={-12} y={10} />
      <MiniBlob color={colors[2]} size={25} duration={3.5} delay={1} x={8} y={-10} />
    </motion.div>
  </div>
);

const getAnimation = (label: string, colors: [string, string, string]) => {
  switch (label) {
    case 'Alignment':
      return <AlignmentAnimation colors={colors} />;
    case 'Transparency':
      return <TransparencyAnimation colors={colors} />;
    case 'Sovereignty':
      return <SovereigntyAnimation colors={colors} />;
    default:
      return null;
  }
};

export const PactTemplateOrb = ({ label, colors, onClick }: PactTemplateOrbProps) => (
  <motion.button
    onClick={onClick}
    className="flex flex-col items-center gap-2.5 group"
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.93 }}
  >
    <motion.div
      className="relative rounded-full overflow-hidden"
      style={{
        width: ORB_SIZE,
        height: ORB_SIZE,
        background: `radial-gradient(circle at 35% 35%, ${colors[0]}, ${colors[1]}, ${colors[2]})`,
        backdropFilter: 'blur(30px)',
        border: '1px solid hsla(0, 0%, 100%, 0.12)',
        boxShadow: `0 0 40px ${colors[0]}, 0 0 80px ${colors[1]}, inset 0 0 30px ${colors[2]}`,
      }}
      animate={{ scale: [1, 1.04, 1] }}
      transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
    >
      {getAnimation(label, colors)}

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
