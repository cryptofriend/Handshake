import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTonAddress } from '@tonconnect/ui-react';
import { Plus, FileSignature, Clock, CheckCircle2, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import YinYangSimulation from '@/components/YinYangSimulation';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  MonsterCreator,
  COLOR_PRESETS,
  getMonster,
  type MonsterConfig,
} from '@/components/dashboard/MonsterCreator';

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
  const [agreements, setAgreements] = useState<AgreementItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!address) navigate('/');
  }, [address, navigate]);

  useEffect(() => {
    if (address) {
      const saved = getMonster(address);
      setMonster(saved);
      if (!saved) setCreatingMonster(true);
    }
  }, [address]);

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
    if (status.includes('pending') || status.includes('signature')) return <Clock className="w-4 h-4 text-primary" />;
    return <FileSignature className="w-4 h-4 text-muted-foreground" />;
  };

  if (!address) return null;

  if (creatingMonster) {
    return (
      <MonsterCreator
        address={address}
        existingMonster={monster}
        onCreated={(config, agreementId) => {
          setMonster(config);
          setCreatingMonster(false);
          navigate(`/sign/${agreementId}`);
        }}
        onCancel={monster ? () => setCreatingMonster(false) : undefined}
      />
    );
  }

  return (
    <div className="flex flex-col min-h-[calc(100vh-8rem)] bg-background">
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
        <p className="text-xs text-muted-foreground">
          Your Handshake Monster {monster?.botUsername && `· @${monster.botUsername}`}
        </p>
      </div>

      <div className="px-5 py-3">
        <Button onClick={handleNewAgreement} className="w-full gap-2">
          <Plus className="w-4 h-4" /> New Agreement
        </Button>
      </div>

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
