import { useState } from 'react';
import { motion } from 'framer-motion';
import { Palette, Bot, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import YinYangSimulation from '@/components/YinYangSimulation';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export const COLOR_PRESETS = [
  {
    label: 'Manifesto',
    sideA: [[190, 220, 130], [170, 200, 115], [45, 200, 140], [50, 220, 120], [190, 240, 160]],
    sideB: [[200, 120, 220], [240, 100, 200], [180, 80, 200], [220, 130, 240], [255, 100, 180]],
    preview: ['hsl(190, 60%, 60%)', 'hsl(280, 60%, 60%)'],
  },
  {
    label: 'Fire & Ice',
    sideA: [[255, 140, 50], [255, 100, 30], [255, 180, 80], [240, 120, 40], [255, 160, 60]],
    sideB: [[60, 160, 255], [40, 120, 240], [80, 180, 255], [50, 140, 220], [100, 200, 255]],
    preview: ['hsl(25, 100%, 60%)', 'hsl(215, 100%, 60%)'],
  },
  {
    label: 'Neon',
    sideA: [[0, 255, 120], [50, 255, 100], [0, 220, 80], [80, 255, 140], [30, 240, 110]],
    sideB: [[255, 0, 200], [255, 50, 220], [220, 0, 180], [255, 80, 240], [240, 30, 200]],
    preview: ['hsl(150, 100%, 50%)', 'hsl(310, 100%, 50%)'],
  },
  {
    label: 'Ocean',
    sideA: [[0, 200, 180], [30, 220, 200], [0, 180, 160], [50, 240, 210], [20, 200, 190]],
    sideB: [[0, 80, 180], [20, 60, 200], [0, 100, 160], [40, 80, 220], [10, 70, 190]],
    preview: ['hsl(175, 100%, 40%)', 'hsl(220, 100%, 35%)'],
  },
  {
    label: 'Sunset',
    sideA: [[255, 200, 50], [255, 180, 30], [255, 220, 80], [240, 190, 40], [255, 210, 60]],
    sideB: [[200, 50, 100], [180, 30, 80], [220, 70, 120], [160, 40, 90], [240, 60, 110]],
    preview: ['hsl(45, 100%, 60%)', 'hsl(340, 70%, 50%)'],
  },
];

export interface MonsterConfig {
  name: string;
  colorSchemeIndex: number;
  agentId?: string;
  apiKey?: string;
  botUsername?: string;
}

export const MONSTER_STORAGE_KEY = 'handshake_monster';

export const getMonster = (address: string): MonsterConfig | null => {
  try {
    const raw = localStorage.getItem(`${MONSTER_STORAGE_KEY}_${address}`);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
};

export const saveMonster = (address: string, config: MonsterConfig) => {
  localStorage.setItem(`${MONSTER_STORAGE_KEY}_${address}`, JSON.stringify(config));
};

interface MonsterCreatorProps {
  address: string;
  existingMonster: MonsterConfig | null;
  onCreated: (config: MonsterConfig, agreementId: string) => void;
  onCancel?: () => void;
}

export const MonsterCreator = ({ address, existingMonster, onCreated, onCancel }: MonsterCreatorProps) => {
  const [monsterName, setMonsterName] = useState(existingMonster?.name || '');
  const [botToken, setBotToken] = useState('');
  const [showToken, setShowToken] = useState(false);
  const [selectedScheme, setSelectedScheme] = useState(existingMonster?.colorSchemeIndex || 0);
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!monsterName.trim()) {
      toast.error('Give your monster a name!');
      return;
    }
    if (!botToken.trim()) {
      toast.error('Paste your Telegram Bot Token from @BotFather');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('register-agent', {
        body: {
          monsterName: monsterName.trim(),
          telegramBotToken: botToken.trim(),
          walletAddress: address,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      const config: MonsterConfig = {
        name: monsterName.trim(),
        colorSchemeIndex: selectedScheme,
        agentId: data.agentId,
        apiKey: data.apiKey,
        botUsername: data.botUsername,
      };

      saveMonster(address, config);
      toast.success(`${config.name} is alive! 🎉 Your first agreement is ready.`);
      onCreated(config, data.agreementId);
    } catch (e: any) {
      toast.error(e.message || 'Failed to register agent');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] px-5 py-8 bg-background">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-2 mb-4"
      >
        <h1 className="text-2xl font-semibold text-foreground tracking-tight">
          Create Your <span className="text-primary">Monster</span>
        </h1>
        <p className="text-sm text-muted-foreground max-w-xs mx-auto">
          Set up your personal Handshake Agent — powered by your own Telegram bot.
        </p>
      </motion.div>

      {/* Preview */}
      <YinYangSimulation
        className="!h-[30vh] max-h-[240px] mb-4"
        colorScheme={COLOR_PRESETS[selectedScheme]}
      />

      {/* Color picker */}
      <div className="flex items-center gap-2 mb-4">
        {COLOR_PRESETS.map((scheme, i) => (
          <button
            key={i}
            onClick={() => setSelectedScheme(i)}
            className={`w-9 h-9 rounded-full border-2 transition-all flex items-center justify-center ${
              i === selectedScheme ? 'border-primary scale-110' : 'border-border'
            }`}
            title={scheme.label}
          >
            <div className="w-6 h-6 rounded-full overflow-hidden flex">
              <div className="w-1/2 h-full" style={{ background: scheme.preview[0] }} />
              <div className="w-1/2 h-full" style={{ background: scheme.preview[1] }} />
            </div>
          </button>
        ))}
      </div>

      {/* Form */}
      <div className="w-full max-w-xs space-y-3">
        <Input
          type="text"
          value={monsterName}
          onChange={(e) => setMonsterName(e.target.value)}
          placeholder="Name your monster..."
          maxLength={24}
          className="rounded-xl"
        />

        <div className="relative">
          <div className="flex items-center gap-2 mb-1">
            <Bot className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Telegram Bot Token</span>
          </div>
          <div className="relative">
            <Input
              type={showToken ? 'text' : 'password'}
              value={botToken}
              onChange={(e) => setBotToken(e.target.value)}
              placeholder="Paste token from @BotFather..."
              className="rounded-xl pr-10 font-mono text-xs"
            />
            <button
              type="button"
              onClick={() => setShowToken(!showToken)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <p className="text-[10px] text-muted-foreground mt-1">
            Open <a href="https://t.me/BotFather" target="_blank" rel="noopener noreferrer" className="text-primary underline">@BotFather</a> on Telegram → /newbot → copy the token
          </p>
        </div>

        <Button onClick={handleCreate} className="w-full gap-2" disabled={loading}>
          {loading ? (
            <>Registering agent...</>
          ) : (
            <><Palette className="w-4 h-4" /> Bring to Life</>
          )}
        </Button>

        {onCancel && (
          <button
            onClick={onCancel}
            className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
};
