import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { useTonAddress, useTonConnectModal, useTonConnectUI } from '@tonconnect/ui-react';
import { toNano } from '@ton/ton';
import { toast } from 'sonner';
import { ArrowLeft, Wallet, PenTool, Copy, AlertTriangle, Pencil, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/handshake/StatusBadge';
import { AgreementCardFlip } from '@/components/handshake/AgreementCardFlip';
import { FullAgreementText } from '@/components/handshake/FullAgreementText';
import { ProofSection } from '@/components/handshake/ProofSection';
import { Agreement, AgreementSignature } from '@/types/agreement';
import { supabase } from '@/integrations/supabase/client';
import logoImg from '@/assets/logo.png';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

// Mock agreement for demo
const MOCK_AGREEMENT: Agreement = {
  id: 'hsk-001',
  version: '1.0',
  createdAt: new Date().toISOString(),
  title: 'Booga × Handshake Partnership',
  summary: 'Strategic partnership agreement defining ownership, roles, and commitments between Booga and Handshake Agent Reserve.',
  status: 'pending_signature',
  parties: [
    { name: 'Booga', role: 'Founder & Lead' },
    { name: 'Handshake', role: 'Agent Reserve' },
  ],
  allocations: [
    { party: 'Booga', percentage: 85, label: 'Booga' },
    { party: 'Handshake', percentage: 15, label: 'Agent Reserve' },
  ],
  fullText: `HANDSHAKE AGREEMENT v1.0

PARTIES
1. Booga ("Founder & Lead")
2. Handshake Agent Reserve ("Agent Reserve")

ROLES & COMMITMENTS
Booga shall serve as the primary decision-maker and lead contributor to the project. Booga commits to:
• Active development and strategic direction
• Community engagement and partnership cultivation
• Transparent communication of project milestones

Handshake Agent Reserve commits to:
• Providing AI-powered agreement infrastructure
• Maintaining protocol integrity and security
• Supporting dispute resolution mechanisms

OWNERSHIP MODEL
• Booga: 85% ownership stake
• Handshake Agent Reserve: 15% ownership stake

Ownership is non-dilutable without mutual written consent of both parties.

PROOF MODEL
All agreements are signed on the TON blockchain. Each signature creates a verifiable, timestamped proof of consent. Agreement hashes are computed deterministically from the canonical agreement text.

AMENDMENT RULE
This agreement may only be amended by mutual consent of both parties, recorded as a new version with fresh on-chain signatures. Previous versions remain immutable and verifiable.

DISPUTE RESOLUTION
In the event of a dispute, both parties agree to engage the Handshake arbitration protocol before seeking external resolution.`,
  shortHash: '0x7f3a..c91e',
  fullHash: '0x7f3a4b2d8e1c6f9a0b5d3e7c2a8f4d6b1e9c3a5d7f2b4e6a8c0d2f4b6e8a0c91e',
  signatures: [],
  receiptStatus: 'none',
  creatorName: 'Booga',
  counterpartyName: 'Handshake',
  task: 'Partnership agreement',
  payment: 'N/A',
  deadline: 'Ongoing',
  notes: '',
  creatorSigned: false,
  counterpartySigned: false,
};

const SignPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const userAddress = useTonAddress();
  const { open: openTonModal } = useTonConnectModal();
  const [tonConnectUI] = useTonConnectUI();

  const [agreement, setAgreement] = useState<Agreement>(MOCK_AGREEMENT);
  const [loading, setLoading] = useState(!!id);
  const [signing, setSigning] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  // Fetch agreement draft from database if id is provided
  useEffect(() => {
    if (!id) return;
    const fetchDraft = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('agreement_drafts')
          .select('*')
          .eq('id', id)
          .single();

        if (error || !data) {
          toast.error('Agreement not found');
          setLoading(false);
          return;
        }

        const parties = (data.parties as any[]) || [];
        const terms = (data.terms as any[]) || [];
        const allocations = ((data as any).allocations as any[]) || [];
        const fullText = (data as any).full_text || '';
        const shortHash = '0x' + id.replace(/-/g, '').slice(0, 8) + '..' + id.replace(/-/g, '').slice(-4);
        const fullHash = '0x' + id.replace(/-/g, '');

        const mapped: Agreement = {
          id: data.id,
          version: '1.0',
          createdAt: data.created_at,
          title: data.title,
          summary: data.summary || '',
          status: data.status === 'sign_ready' ? 'pending_signature' : 'draft',
          parties: parties.map((p: any) => ({
            name: p.name || p,
            role: p.role || null,
          })),
          allocations: allocations.map((a: any) => ({
            party: a.party,
            percentage: a.percentage,
            label: a.label || a.party,
          })),
          fullText: fullText || `HANDSHAKE AGREEMENT v1.0\n\nTITLE\n${data.title}\n\nSUMMARY\n${data.summary}\n\nTERMS\n${terms.map((t: string, i: number) => `${i + 1}. ${t}`).join('\n')}`,
          shortHash,
          fullHash,
          signatures: [],
          receiptStatus: 'none',
          creatorName: parties[0]?.name || 'Party A',
          counterpartyName: parties[1]?.name || 'Party B',
          task: data.title,
          payment: terms.find((t: string) => t.toLowerCase().includes('payment') || t.toLowerCase().includes('$')) || 'See terms',
          deadline: terms.find((t: string) => t.toLowerCase().includes('deadline') || t.toLowerCase().includes('date')) || 'See terms',
          notes: '',
          creatorSigned: false,
          counterpartySigned: false,
        };

        setAgreement(mapped);
      } catch (err) {
        console.error('Error fetching agreement:', err);
        toast.error('Failed to load agreement');
      } finally {
        setLoading(false);
      }
    };
    fetchDraft();
  }, [id]);

  const userHasSigned = agreement.signatures.some(
    (s) => s.walletAddress === userAddress
  );

  const handleSignConfirm = async () => {
    setConfirmOpen(false);
    setSigning(true);

    try {
      const transaction = {
        validUntil: Math.floor(Date.now() / 1000) + 300,
        messages: [
          {
            address: userAddress,
            amount: toNano('0.01').toString(),
            payload: undefined,
          },
        ],
      };

      await tonConnectUI.sendTransaction(transaction);

      const newSig: AgreementSignature = {
        party: agreement.parties[0]?.name || 'Signer',
        walletAddress: userAddress,
        signedAt: new Date().toISOString(),
        txHash: '0x' + Array.from({ length: 16 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
        blockchainStatus: 'pending',
      };

      setAgreement((prev) => ({
        ...prev,
        signatures: [...prev.signatures, newSig],
        status: prev.signatures.length === 0 ? 'signed_by_one' : 'fully_signed',
        receiptStatus: 'minting',
      }));

      toast.success('Agreement signed on-chain!');

      // Simulate confirmation
      setTimeout(() => {
        setAgreement((prev) => ({
          ...prev,
          signatures: prev.signatures.map((s) =>
            s.walletAddress === userAddress
              ? { ...s, blockchainStatus: 'confirmed' as const }
              : s
          ),
          receiptStatus: 'minted',
        }));
        toast.success('Transaction confirmed');
      }, 5000);
    } catch (err: any) {
      if (err?.message?.includes('Cancelled') || err?.message?.includes('canceled')) {
        toast.info('Transaction cancelled');
      } else {
        toast.error(err?.message || 'Transaction failed');
      }
    } finally {
      setSigning(false);
    }
  };

  const handleCopyHash = () => {
    navigator.clipboard.writeText(agreement.fullHash);
    toast.success('Agreement hash copied');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'hsl(var(--background))' }}>
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="text-muted-foreground text-sm"
        >
          Loading agreement...
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 relative overflow-hidden" style={{ background: 'hsl(var(--background))' }}>
      {/* Ambient orb glow behind content */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute -top-20 left-1/2 -translate-x-1/2 w-[400px] h-[400px] rounded-full blur-[120px] opacity-20"
          style={{ background: 'radial-gradient(circle, hsl(var(--orb-blue)), hsl(var(--orb-purple) / 0.5), transparent)' }}
        />
        <div
          className="absolute bottom-0 left-0 w-[300px] h-[300px] rounded-full blur-[100px] opacity-10"
          style={{ background: 'hsl(var(--orb-cyan))' }}
        />
        <div
          className="absolute bottom-20 right-0 w-[200px] h-[200px] rounded-full blur-[80px] opacity-10"
          style={{ background: 'hsl(var(--orb-magenta))' }}
        />
      </div>

      <div className="relative z-10">
      {/* Header */}
      <div className="px-5 pt-5 pb-3">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 rounded-xl hover:bg-muted transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <img src={logoImg} alt="Handshake" className="w-7 h-7 object-contain" />
          <div className="w-9" /> {/* spacer */}
        </div>

        <div className="flex items-center gap-2 mb-1">
          <StatusBadge status={agreement.status} />
        </div>

        <h1 className="text-xl font-semibold text-foreground mt-2">
          Handshake Agreement
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          v{agreement.version} · {new Date(agreement.createdAt).toLocaleDateString()}
        </p>
      </div>

      <div className="px-5 max-w-md mx-auto space-y-5">
        {/* Agreement Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <AgreementCardFlip agreement={agreement} />
        </motion.div>

        {/* Full Agreement Text */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
        >
          <FullAgreementText fullText={agreement.fullText} />
        </motion.div>

        {/* Signature Actions */}
        <motion.div
          className="space-y-3"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          {/* Wallet state */}
          {userAddress && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-muted/50">
              <Wallet className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-mono text-muted-foreground">
                {userAddress.slice(0, 8)}...{userAddress.slice(-4)}
              </span>
            </div>
          )}

          {/* Primary CTA */}
          {!userAddress ? (
            <Button
              className="w-full rounded-2xl h-14 text-base font-semibold gap-2"
              onClick={() => openTonModal()}
            >
              <Wallet className="w-4 h-4" />
              Connect TON Wallet
            </Button>
          ) : userHasSigned ? (
            <Button
              className="w-full rounded-2xl h-14 text-base font-semibold gap-2 bg-success hover:bg-success/90 text-success-foreground"
              disabled
            >
              <Check className="w-4 h-4" />
              Signed
            </Button>
          ) : (
            <Button
              className="w-full rounded-2xl h-14 text-base font-semibold gap-2"
              disabled={signing}
              onClick={() => setConfirmOpen(true)}
            >
              <PenTool className="w-4 h-4" />
              {signing ? 'Signing...' : 'Sign with TON'}
            </Button>
          )}

          {/* Secondary actions */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1 rounded-xl h-10 text-xs gap-1.5"
              onClick={() => toast.info('Edit request sent')}
            >
              <Pencil className="w-3.5 h-3.5" />
              Request Edit
            </Button>
            <Button
              variant="outline"
              className="flex-1 rounded-xl h-10 text-xs gap-1.5 text-destructive border-destructive/20 hover:bg-destructive/5"
              onClick={() => toast.info('Dispute initiated')}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              Dispute
            </Button>
            <Button
              variant="outline"
              className="rounded-xl h-10 px-3 text-xs"
              onClick={handleCopyHash}
            >
              <Copy className="w-3.5 h-3.5" />
            </Button>
          </div>
        </motion.div>

        {/* Proof Section */}
        <ProofSection
          signatures={agreement.signatures}
          receiptStatus={agreement.receiptStatus}
          shortHash={agreement.shortHash}
        />
      </div>

      {/* Confirmation Modal */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent
          className="rounded-3xl max-w-sm mx-auto border-0 overflow-hidden"
          style={{
            background: 'hsla(230, 25%, 97%, 0.85)',
            backdropFilter: 'blur(40px)',
            boxShadow: '0 0 60px hsl(var(--orb-blue) / 0.15), 0 0 120px hsl(var(--orb-purple) / 0.08), 0 20px 60px hsl(230 25% 10% / 0.08)',
            border: '1px solid hsl(var(--orb-blue) / 0.15)',
          }}
        >
          <DialogHeader>
            <DialogTitle className="text-foreground text-center">Confirm Signature</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <p className="text-sm text-muted-foreground text-center">
              You are about to sign <span className="font-semibold text-foreground">version {agreement.version}</span> of this agreement.
            </p>

            <div className="rounded-xl bg-muted/50 p-3 text-center">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Agreement Fingerprint</p>
              <p className="font-mono text-xs text-foreground/80">{agreement.shortHash}</p>
            </div>

            <p className="text-xs text-muted-foreground text-center">
              A 0.01 TON transaction will be sent as your cryptographic proof of consent.
            </p>

            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                className="flex-1 rounded-xl h-11"
                onClick={() => setConfirmOpen(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 rounded-xl h-11 gap-1.5"
                onClick={handleSignConfirm}
              >
                <PenTool className="w-3.5 h-3.5" />
                Sign
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      </div> {/* close relative z-10 wrapper */}
    </div>
  );
};

export default SignPage;
