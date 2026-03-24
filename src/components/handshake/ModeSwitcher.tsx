import { motion } from 'framer-motion';
import { User, Bot } from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import { cn } from '@/lib/utils';

export const ModeSwitcher = () => {
  const mode = useAppStore((s) => s.mode);
  const setMode = useAppStore((s) => s.setMode);

  return (
    <div className="relative flex items-center bg-muted/50 backdrop-blur-sm rounded-2xl p-1 border border-border/50">
      <motion.div
        className="absolute top-1 bottom-1 rounded-xl bg-primary/10 border border-primary/20"
        initial={false}
        animate={{
          left: mode === 'human' ? '4px' : '50%',
          width: 'calc(50% - 4px)',
        }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      />
      <button
        onClick={() => setMode('human')}
        className={cn(
          'relative z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors',
          mode === 'human' ? 'text-primary' : 'text-muted-foreground'
        )}
      >
        <User className="w-3.5 h-3.5" />
        Human
      </button>
      <button
        onClick={() => setMode('agent')}
        className={cn(
          'relative z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors',
          mode === 'agent' ? 'text-primary' : 'text-muted-foreground'
        )}
      >
        <Bot className="w-3.5 h-3.5" />
        Agent
      </button>
    </div>
  );
};
