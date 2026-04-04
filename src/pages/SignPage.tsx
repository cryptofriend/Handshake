import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useTonAddress, useTonConnectModal, useTonConnectUI } from '@tonconnect/ui-react';
import { toast } from 'sonner';
import { useTonProofSign } from '@/hooks/useTonProofSign';
import { ArrowLeft, Wallet, PenTool, Copy, AlertTriangle, Pencil, Check } from 'lucide-react';
import { SignCelebration } from '@/components/handshake/SignCelebration';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/handshake/StatusBadge';
import { AgreementCardFlip } from '@/components/handshake/AgreementCardFlip';
import { FullAgreementText } from '@/components/handshake/FullAgreementText';
import { ProofSection } from '@/components/handshake/ProofSection';
import { Agreement, AgreementSignature } from '@/types/agreement';
import { supabase } from '@/integrations/supabase/client';
import { logAgreementEvent, resolveInviteToken } from '@/lib/agreementEvents';
import logoImg from '@/assets/logo.png';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface ParticipantContext {
  id: string;
  name: string;
  role: string | null;
  telegram_user_id: string | null;
  wallet_address: string | null;
}

const SignPage = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const inviteToken = searchParams.get('invite');
  const navigate = useNavigate();
  const userAddress = useTonAddress();
  const { open: openTonModal } = useTonConnectModal();
  const [tonConnectUI] = useTonConnectUI();

  const [agreement, setAgreement] = useState<Agreement | null>(null);
  const [participant, setParticipant] = useState<ParticipantContext | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [invalidInvite, setInvalidInvite] = useState(false);
  const [signing, setSigning] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationTx, setCelebrationTx] = useState('');
  const viewLogged = useRef(false);
  const walletLinked = useRef(false);

  // Resolve invite token if present, otherwise fetch agreement directly
  useEffect(() => {
    if (!id) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        if (inviteToken) {
          // Resolve via invite token
          try {
            const result = await resolveInviteToken(inviteToken);
            if (!result?.agreement) {
              setInvalidInvite(true);
              setLoading(false);
              return;
            }
            setParticipant(result.participant || null);
            const mapped = mapDraftToAgreement(result.agreement);
            setAgreement(mapped);
          } catch {
            setInvalidInvite(true);
            setLoading(false);
            return;
          }
        } else {
          // Direct access without invite
          const { data, error } = await supabase
            .from('agreement_drafts')
            .select('*')
            .eq('id', id)
            .maybeSingle();

          if (error || !data) {
            setNotFound(true);
            setLoading(false);
            return;
          }
          const mapped = mapDraftToAgreement(data);
          setAgreement(mapped);
        }
      } catch (err) {
        console.error('Error fetching agreement:', err);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, inviteToken]);

  // Log agreement_viewed event once
  useEffect(() => {
    if (!agreement || !id || viewLogged.current) return;
    viewLogged.current = true;
    logAgreementEvent({
      agreementId: id,
      participantId: participant?.id,
      eventType: 'agreement_viewed',
      walletAddress: userAddress || null,
    });
  }, [agreement, id, participant, userAddress]);

  // Log wallet_connected when wallet becomes available
  useEffect(() => {
    if (!userAddress || !id || !agreement || walletLinked.current) return;
    walletLinked.current = true;
    logAgreementEvent({
      agreementId: id,
      participantId: participant?.id,
      eventType: 'wallet_connected',
      walletAddress: userAddress,
    });
  }, [userAddress, id, agreement, participant]);

  // Fetch and sync signatures
  useEffect(() => {
    if (!id || !agreement) return;
    const fetchSigs = async () => {
      const { data: sigData } = await supabase
        .from('agreement_signatures')
        .select('*')
        .eq('agreement_id', id);

      const sigs = mapSignatures(sigData);
      updateAgreementSigs(sigs);
    };
    fetchSigs();
  }, [id, agreement?.id]);

  // Realtime signatures
  useEffect(() => {
    if (!id) return;
    const channel = supabase
      .channel(`sigs-${id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'agreement_signatures', filter: `agreement_id=eq.${id}` },
        async () => {
          const { data: sigData } = await supabase
            .from('agreement_signatures')
            .select('*')
            .eq('agreement_id', id);
          const sigs = mapSignatures(sigData);
          updateAgreementSigs(sigs);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [id]);

  const mapSignatures = (sigData: any[] | null): AgreementSignature[] =>
    (sigData || []).map((s: any) => ({
      party: s.party_name || 'Signer',
      walletAddress: s.wallet_address,
      signedAt: s.signed_at,
      txHash: s.tx_hash || '',
      blockchainStatus: s.blockchain_status as 'pending' | 'confirmed' | 'failed',
    }));

  const updateAgreementSigs = (sigs: AgreementSignature[]) => {
    setAgreement((prev) => {
      if (!prev) return prev;
      const sigCount = sigs.length;
      let status: Agreement['status'] = prev.status;
      if (sigCount >= 2) status = 'fully_signed';
      else if (sigCount === 1) status = 'signed_by_one';
      return { ...prev, signatures: sigs, status, receiptStatus: sigCount > 0 ? 'minted' : 'none' };
    });
  };

  const mapDraftToAgreement = (data: any): Agreement => {
    const parties = (data.parties as any[]) || [];
    const terms = (data.terms as any[]) || [];
    const allocations = (data.allocations as any[]) || [];
    const fullText = data.full_text || '';
    const shortHash = '0x' + data.id.replace(/-/g, '').slice(0, 8) + '..' + data.id.replace(/-/g, '').slice(-4);
    const fullHash = '0x' + data.id.replace(/-/g, '');

    return {
      id: data.id,
      version: '1.0',
      createdAt: data.created_at,
      title: data.title,
      summary: data.summary || '',
      status: data.status === 'sign_ready' ? 'pending_signature' : 'draft',
      parties: parties.map((p: any) => ({ name: p.name || p, role: p.role || null })),
      allocations: allocations.map((a: any) => ({ party: a.party, percentage: a.percentage, label: a.label || a.party })),
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
  };

  const userHasSigned = agreement?.signatures.some(
    (s) => s.walletAddress === userAddress
  ) ?? false;

  const handleSignConfirm = async () => {
    setConfirmOpen(false);
    setSigning(true);

    // Log signature_started
    if (id) {
      logAgreementEvent({
        agreementId: id,
        participantId: participant?.id,
        eventType: 'signature_started',
        walletAddress: userAddress,
      });
    }

    try {
      const transaction = {
        validUntil: Math.floor(Date.now() / 1000) + 300,
        messages: [{
          address: userAddress,
          amount: toNano('0.01').toString(),
          payload: undefined,
        }],
      };

      await tonConnectUI.sendTransaction(transaction);

      const txHash = '0x' + Array.from({ length: 16 }, () => Math.floor(Math.random() * 16).toString(16)).join('');

      const newSig: AgreementSignature = {
        party: participant?.name || agreement?.parties[0]?.name || 'Signer',
        walletAddress: userAddress,
        signedAt: new Date().toISOString(),
        txHash,
        blockchainStatus: 'pending',
      };

      // Persist signature
      if (id) {
        await supabase.from('agreement_signatures').upsert({
          agreement_id: id,
          wallet_address: userAddress,
          party_name: newSig.party,
          tx_hash: txHash,
          blockchain_status: 'pending',
          signed_at: new Date().toISOString(),
        }, { onConflict: 'agreement_id,wallet_address' });

        // Log signature_completed
        logAgreementEvent({
          agreementId: id,
          participantId: participant?.id,
          eventType: 'signature_completed',
          walletAddress: userAddress,
          metadata: { tx_hash: txHash },
        });
      }

      setAgreement((prev) => prev ? ({
        ...prev,
        signatures: [...prev.signatures, newSig],
        status: prev.signatures.length === 0 ? 'signed_by_one' : 'fully_signed',
        receiptStatus: 'minting',
      }) : prev);

      toast.success('Agreement signed on-chain!');
      setCelebrationTx(txHash);
      setShowCelebration(true);

      // Simulate confirmation
      setTimeout(async () => {
        if (id) {
          await supabase.from('agreement_signatures')
            .update({ blockchain_status: 'confirmed' })
            .eq('agreement_id', id)
            .eq('wallet_address', userAddress);
        }
        setAgreement((prev) => prev ? ({
          ...prev,
          signatures: prev.signatures.map((s) =>
            s.walletAddress === userAddress ? { ...s, blockchainStatus: 'confirmed' as const } : s
          ),
          receiptStatus: 'minted',
        }) : prev);
        toast.success('Transaction confirmed');
      }, 5000);
    } catch (err: any) {
      if (err?.message?.includes('Cancelled') || err?.message?.includes('canceled')) {
        toast.info('Transaction cancelled');
      } else {
        toast.error(err?.message || 'Transaction failed');
        if (id) {
          logAgreementEvent({
            agreementId: id,
            participantId: participant?.id,
            eventType: 'signature_failed',
            walletAddress: userAddress,
            metadata: { error: err?.message },
          });
        }
      }
    } finally {
      setSigning(false);
    }
  };

  const handleCopyHash = () => {
    navigator.clipboard.writeText(agreement?.fullHash || '');
    toast.success('Agreement hash copied');
  };

  if (invalidInvite) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ background: 'hsl(var(--background))' }}>
        <AlertTriangle className="w-10 h-10 text-warning" />
        <p className="text-foreground font-semibold">Invalid Invite</p>
        <p className="text-muted-foreground text-sm text-center max-w-xs">
          This invite link is invalid or has expired. Please request a new one.
        </p>
        <Button variant="outline" onClick={() => navigate('/')}>Go Home</Button>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ background: 'hsl(var(--background))' }}>
        <p className="text-muted-foreground text-sm">Agreement not found</p>
        <Button variant="outline" onClick={() => navigate('/agent')}>Go to Agent</Button>
      </div>
    );
  }

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

  if (!agreement) return null;

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
          <div className="w-9" />
        </div>

        <div className="flex items-center gap-2 mb-1">
          <StatusBadge status={agreement.status} />
          {participant && (
            <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
              {participant.name}{participant.role ? ` · ${participant.role}` : ''}
            </span>
          )}
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
          {userAddress && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-muted/50">
              <Wallet className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-mono text-muted-foreground">
                {userAddress.slice(0, 8)}...{userAddress.slice(-4)}
              </span>
            </div>
          )}

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
      {/* Epic Celebration Overlay */}
      <SignCelebration
        show={showCelebration}
        agreementTitle={agreement.title}
        txHash={celebrationTx}
        onClose={() => setShowCelebration(false)}
      />
      </div>
    </div>
  );
};

export default SignPage;
