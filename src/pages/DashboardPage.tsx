import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTonAddress } from '@tonconnect/ui-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, FileSignature, Clock, CheckCircle2, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import YinYangSimulation from '@/components/YinYangSimulation';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const COLOR_PRESETS = [
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

interface MonsterConfig {
  name: string;
  colorSchemeIndex: number;
}

const MONSTER_STORAGE_KEY = 'handshake_monster';

const getMonster = (address: string): MonsterConfig | null => {
  try {
    const raw = localStorage.getItem(`${MONSTER_STORAGE_KEY}_${address}`);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
};

const saveMonster = (address: string, config: MonsterConfig) => {
  localStorage.setItem(`${MONSTER_STORAGE_KEY}_${address}`, JSON.stringify(config));
};

interface AgreementItem {
  id: string;
  title: string;
  status: string;
  created_at: string;
}

const DashboardPage = () => {
  const address = useTonAddress();
  const navigate = useNavigate();
  const [monster, setMonster] = useState<MonsterConfig | null>(null);
  const [creatingMonster, setCreatingMonster] = useState(false);
  const [monsterName, setMonsterName] = useState('');
  const [selectedScheme, setSelectedScheme] = useState(0);
  const [agreements, setAgreements] = useState<AgreementItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Redirect if not connected
  useEffect(() => {
    if (!address) navigate('/');
  }, [address, navigate]);

  // Load monster config
  useEffect(() => {
    if (address) {
      const saved = getMonster(address);
      setMonster(saved);
      if (!saved) setCreatingMonster(true);
    }
  }, [address]);

  // Load agreements
  useEffect(() => {
    if (!address) return;
    const fetchAgreements = async () => {
      setLoading(true);
      const { data } = await supabase
        .from('agreement_drafts')
        .select('id, title, status, created_at')
        .or(`user_id.eq.${address},session_id.eq.${address}`)
        .order('created_at', { ascending: false })
        .limit(50);
      setAgreements(data || []);
      setLoading(false);
    };
    fetchAgreements();
  }, [address]);

  const handleCreateMonster = () => {
    if (!monsterName.trim()) {
      toast.error('Give your monster a name!');
      return;
    }
    const config: MonsterConfig = { name: monsterName.trim(), colorSchemeIndex: selectedScheme };
    saveMonster(address!, config);
    setMonster(config);
    setCreatingMonster(false);
    toast.success(`${config.name} is alive! 🎉`);
  };

  const handleNewAgreement = () => {
    if (!monster) {
      setCreatingMonster(true);
      toast('Create your monster first to start making agreements!');
      return;
    }
    navigate('/agent');
  };

  const statusIcon = (status: string) => {
    if (status === 'fully_signed' || status === 'executed') return <CheckCircle2 className="w-4 h-4 text-[hsl(var(--success))]" />;
    if (status.includes('pending') || status.includes('signature')) return <Clock className="w-4 h-4 text-yellow-500" />;
    return <FileSignature className="w-4 h-4 text-muted-foreground" />;
  };

  if (!address) return null;

  // Monster creation flow
  if (creatingMonster) {
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
            Customize your Handshake Monster — your personal agreement agent.
          </p>
        </motion.div>

        {/* Preview */}
        <YinYangSimulation
          className="!h-[35vh] max-h-[280px] mb-4"
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

        {/* Name input */}
        <div className="w-full max-w-xs space-y-3">
          <input
            type="text"
            value={monsterName}
            onChange={(e) => setMonsterName(e.target.value)}
            placeholder="Name your monster..."
            maxLength={24}
            className="w-full px-4 py-3 rounded-xl border border-border bg-card text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <Button onClick={handleCreateMonster} className="w-full gap-2">
            <Palette className="w-4 h-4" /> Bring to Life
          </Button>
          {monster && (
            <button
              onClick={() => setCreatingMonster(false)}
              className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    );
  }

  // Dashboard
  return (
    <div className="flex flex-col min-h-[calc(100vh-8rem)] bg-background">
      {/* Monster header */}
      <div className="flex flex-col items-center pt-4 pb-2 px-5">
        <div className="relative">
          <YinYangSimulation
            className="!h-[25vh] max-h-[200px]"
            colorScheme={COLOR_PRESETS[monster?.colorSchemeIndex ?? 0]}
          />
          <button
            onClick={() => setCreatingMonster(true)}
            className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            title="Customize monster"
          >
            <Palette className="w-3.5 h-3.5" />
          </button>
        </div>
        <h2 className="text-lg font-semibold text-foreground mt-2">{monster?.name}</h2>
        <p className="text-xs text-muted-foreground">Your Handshake Monster</p>
      </div>

      {/* New agreement button */}
      <div className="px-5 py-3">
        <Button onClick={handleNewAgreement} className="w-full gap-2">
          <Plus className="w-4 h-4" /> New Agreement
        </Button>
      </div>

      {/* Agreements list */}
      <div className="flex-1 px-5 pb-20">
        <h3 className="text-sm font-medium text-muted-foreground mb-3">Your Agreements</h3>
        {loading ? (
          <div className="text-center text-sm text-muted-foreground py-8">Loading...</div>
        ) : agreements.length === 0 ? (
          <Card className="p-6 text-center">
            <p className="text-sm text-muted-foreground">No agreements yet. Create your first one!</p>
          </Card>
        ) : (
          <div className="space-y-2">
            {agreements.map((a) => (
              <Card
                key={a.id}
                className="p-3 flex items-center gap-3 cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => navigate(`/sign/${a.id}`)}
              >
                {statusIcon(a.status)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{a.title}</p>
                  <p className="text-[11px] text-muted-foreground">{new Date(a.created_at).toLocaleDateString()}</p>
                </div>
                <span className="text-[10px] font-mono text-muted-foreground capitalize">{a.status.replace(/_/g, ' ')}</span>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
