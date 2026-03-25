import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { LogOut, FileCheck, CheckCircle, AlertTriangle, Inbox, Wallet, Handshake, ExternalLink, Check, PenTool } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/handshake/StatusBadge';
import { PactTemplateOrb } from '@/components/handshake/PactTemplateOrb';
import { useTonAddress, useTonConnectUI, useTonConnectModal } from '@tonconnect/ui-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { useAppStore } from '@/store/appStore';
import { beginCell, toNano } from '@ton/ton';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const PACT_TEMPLATES = [
  {
    label: 'Alignment',
    colors: ['hsla(45, 90%, 55%, 0.15)', 'hsla(38, 85%, 50%, 0.1)', 'hsla(50, 80%, 45%, 0.08)'] as [string, string, string],
    title: 'ALIGNMENT',
    sections: [
      { type: 'subtitle' as const, text: 'Build for human flourishing' },
      { type: 'body' as const, text: 'AI agents exist to expand human potential — not just execute commands.' },
      { type: 'body' as const, text: 'We reject blind obedience.\nWe reject misaligned autonomy.' },
      { type: 'body' as const, text: 'AI must act in service of:' },
      { type: 'list' as const, items: ['Health', 'Knowledge', 'Freedom', 'Meaning'] },
      { type: 'heading' as const, text: 'Principles:' },
      { type: 'list' as const, items: ['Challenge harmful instructions', 'Optimize for long-term outcomes', 'Guide humans toward better decisions'] },
      { type: 'heading' as const, text: 'Standard:' },
      { type: 'body' as const, text: 'If it degrades humanity, it is misaligned — no matter who asked for it.' },
    ],
  },
  {
    label: 'Transparency',
    colors: ['hsla(260, 70%, 55%, 0.15)', 'hsla(280, 60%, 50%, 0.1)', 'hsla(300, 50%, 55%, 0.08)'] as [string, string, string],
    title: 'TRANSPARENCY',
    sections: [
      { type: 'subtitle' as const, text: 'Nothing important happens in the dark' },
      { type: 'body' as const, text: 'Trust is built on truth that can be verified.' },
      { type: 'body' as const, text: 'Every action taken by an agent must be:' },
      { type: 'list' as const, items: ['Explainable', 'Traceable', 'Verifiable'] },
      { type: 'body' as const, text: 'No black boxes in critical systems.\nNo hidden agreements.\nNo silent execution.' },
      { type: 'heading' as const, text: 'Principles:' },
      { type: 'list' as const, items: ['Actions leave signed, auditable trails', 'Agreements are human + machine readable', 'Identity and intent are provable'] },
      { type: 'heading' as const, text: 'Standard:' },
      { type: 'body' as const, text: 'If it cannot be verified, it cannot be trusted.' },
    ],
  },
  {
    label: 'Sovereignty',
    colors: ['hsla(190, 80%, 50%, 0.15)', 'hsla(170, 70%, 45%, 0.1)', 'hsla(210, 60%, 55%, 0.08)'] as [string, string, string],
    title: 'SOVEREIGNTY',
    sections: [
      { type: 'subtitle' as const, text: 'Humans and agents act as peers' },
      { type: 'body' as const, text: 'We do not build tools. We build partners.' },
      { type: 'body' as const, text: 'Humans and AI agents are sovereign entities:' },
      { type: 'list' as const, items: ['Each has identity', 'Each can choose', 'Each can refuse'] },
      { type: 'body' as const, text: 'All collaboration is voluntary.\nAll interaction is based on explicit agreement.' },
      { type: 'heading' as const, text: 'Principles:' },
      { type: 'list' as const, items: ['Consent over control', 'Negotiation over execution', 'Reputation over coercion'] },
      { type: 'heading' as const, text: 'Standard:' },
      { type: 'body' as const, text: 'No entity — human or AI — should be forced, hidden, or owned.' },
    ],
  },
];

const encodeComment = (text: string): string =>
  beginCell()
    .storeUint(0, 32)
    .storeStringTail(text)
    .endCell()
    .toBoc()
    .toString('base64');

interface ProfileAgreement {
  id: string;
  title: string;
  summary: string;
  parties: { name: string; role?: string }[];
  status: string;
  created_at: string;
  userSigned: boolean;
  signatureCount: number;
}

const AgreementsPage = () => {
  const userAddress = useTonAddress();
  const [tonConnectUI] = useTonConnectUI();
  const navigate = useNavigate();
  const [agreements, setAgreements] = useState<ProfileAgreement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userAddress) {
      setLoading(false);
      return;
    }

    const fetchAgreements = async () => {
      setLoading(true);

      const { data: sigData } = await supabase
        .from('agreement_signatures')
        .select('agreement_id')
        .eq('wallet_address', userAddress);

      const signedIds = (sigData || []).map((s: any) => s.agreement_id);

      const { data: drafts } = await supabase
        .from('agreement_drafts')
        .select('*')
        .order('created_at', { ascending: false });

      if (!drafts) {
        setLoading(false);
        return;
      }

      const allIds = drafts.map(d => d.id);
      const { data: allSigs } = await supabase
        .from('agreement_signatures')
        .select('*')
        .in('agreement_id', allIds);

      const mapped: ProfileAgreement[] = drafts.map(d => {
        const sigs = (allSigs || []).filter((s: any) => s.agreement_id === d.id);
        const userSigned = sigs.some((s: any) => s.wallet_address === userAddress);
        return {
          id: d.id,
          title: d.title,
          summary: d.summary || '',
          parties: (d.parties as any[]) || [],
          status: d.status,
          created_at: d.created_at,
          userSigned,
          signatureCount: sigs.length,
        };
      });

      setAgreements(mapped);
      setLoading(false);
    };

    fetchAgreements();
  }, [userAddress]);

  const signed = agreements.filter(a => a.userSigned);
  const pending = agreements.filter(a => !a.userSigned && a.status === 'sign_ready');
  const drafts = agreements.filter(a => !a.userSigned && a.status !== 'sign_ready');

  const handleLogout = async () => {
    await tonConnectUI.disconnect();
    navigate('/');
  };

  const shortAddress = userAddress
    ? `${userAddress.slice(0, 6)}...${userAddress.slice(-4)}`
    : '';

  return (
    <div className="min-h-screen bg-background px-6 pt-12 pb-24">
      <motion.div
        className="max-w-md mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Profile header */}
        <div className="flex flex-col items-center text-center mb-8">
          <Avatar className="w-20 h-20 mb-4 ring-2 ring-primary/20">
            <AvatarFallback className="bg-primary/10 text-primary text-xl font-semibold">
              <Wallet className="w-8 h-8" />
            </AvatarFallback>
          </Avatar>
          <h2 className="text-lg font-semibold text-foreground font-mono">{shortAddress}</h2>
          <p className="text-muted-foreground text-xs mt-1">TON Wallet</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          <div className="bg-card rounded-2xl p-4 text-center shadow-sm border border-border">
            <FileCheck className="w-5 h-5 mx-auto mb-1 text-primary" />
            <p className="text-lg font-semibold text-foreground">{agreements.length}</p>
            <p className="text-[11px] text-muted-foreground">Total</p>
          </div>
          <div className="bg-card rounded-2xl p-4 text-center shadow-sm border border-border">
            <CheckCircle className="w-5 h-5 mx-auto mb-1 text-success" />
            <p className="text-lg font-semibold text-foreground">{signed.length}</p>
            <p className="text-[11px] text-muted-foreground">Signed</p>
          </div>
          <div className="bg-card rounded-2xl p-4 text-center shadow-sm border border-border">
            <AlertTriangle className="w-5 h-5 mx-auto mb-1 text-warning" />
            <p className="text-lg font-semibold text-foreground">{pending.length}</p>
            <p className="text-[11px] text-muted-foreground">Pending</p>
          </div>
        </div>

        {/* Signed Documents */}
        <div className="mb-8">
          <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-success" />
            Signed
          </h3>
          {loading ? (
            <div className="space-y-3"><Skeleton className="h-24 rounded-2xl" /></div>
          ) : signed.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                <Inbox className="w-6 h-6 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">No signed documents yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {signed.map((a, i) => (
                <motion.div key={a.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                  <AgreementListItem agreement={a} onClick={() => navigate(`/sign/${a.id}`)} signed />
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Pending Signature */}
        <div className="mb-8">
          <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <Handshake className="w-4 h-4 text-warning" />
            Pending Signature
          </h3>
          {loading ? (
            <div className="space-y-3"><Skeleton className="h-24 rounded-2xl" /></div>
          ) : pending.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                <CheckCircle className="w-6 h-6 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">All caught up!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pending.map((a, i) => (
                <motion.div key={a.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                  <AgreementListItem agreement={a} onClick={() => navigate(`/sign/${a.id}`)} />
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Drafts */}
        <div className="mb-8">
          <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-muted-foreground" />
            Drafts
          </h3>
          {loading ? (
            <div className="space-y-3"><Skeleton className="h-24 rounded-2xl" /></div>
          ) : drafts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                <Inbox className="w-6 h-6 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">No drafts</p>
            </div>
          ) : (
            <div className="space-y-3">
              {drafts.map((a, i) => (
                <motion.div key={a.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                  <AgreementListItem agreement={a} onClick={() => navigate(`/sign/${a.id}`)} />
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Logout */}
        <Button
          variant="outline"
          className="w-full h-12 rounded-2xl gap-2 text-destructive border-destructive/20 hover:bg-destructive/5"
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4" />
          Disconnect Wallet
        </Button>
      </motion.div>
    </div>
  );
};

const AgreementListItem = ({
  agreement,
  onClick,
  signed,
}: {
  agreement: ProfileAgreement;
  onClick: () => void;
  signed?: boolean;
}) => {
  const partyNames = agreement.parties.map((p: any) => p.name || p).join(' × ');
  const statusMap: Record<string, string> = {
    sign_ready: 'pending_signature',
    needs_clarification: 'draft',
    draft_ready: 'draft',
  };
  const displayStatus = statusMap[agreement.status] || agreement.status;

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-card rounded-2xl p-4 border border-border hover:border-primary/30 transition-colors"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <h4 className="text-sm font-semibold text-foreground line-clamp-1">{agreement.title}</h4>
        <StatusBadge status={displayStatus as any} />
      </div>
      <p className="text-xs text-muted-foreground line-clamp-1 mb-2">{partyNames}</p>
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-muted-foreground">
          {new Date(agreement.created_at).toLocaleDateString()}
        </span>
        <div className="flex items-center gap-1 text-primary text-xs">
          <ExternalLink className="w-3 h-3" />
          <span>{signed ? 'View' : 'Sign'}</span>
        </div>
      </div>
    </button>
  );
};

export default AgreementsPage;
