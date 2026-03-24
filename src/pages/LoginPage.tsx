import { motion } from 'framer-motion';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Orb } from '@/components/handshake/Orb';
import { useAppStore } from '@/store/appStore';
import { PactTemplateOrb } from '@/components/handshake/PactTemplateOrb';
import { Button } from '@/components/ui/button';
import { Check, PenTool, Wallet } from 'lucide-react';
import { useTonConnectUI, useTonConnectModal, useTonAddress } from '@tonconnect/ui-react';
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

const LoginPage = () => {
  const signedPacts = useAppStore((s) => s.signedPacts);
  const addSignedPact = useAppStore((s) => s.addSignedPact);
  const [selectedTemplate, setSelectedTemplate] = useState<typeof PACT_TEMPLATES[number] | null>(null);
  const [signing, setSigning] = useState(false);
  const navigate = useNavigate();
  const [tonConnectUI] = useTonConnectUI();
  const { open: openTonModal } = useTonConnectModal();
  const userAddress = useTonAddress();

  const handleSign = async (pactTitle: string) => {
    if (!userAddress) {
      // Close the dialog first so TON Connect modal isn't blocked by focus trap
      setSelectedTemplate(null);
      setTimeout(() => openTonModal(), 150);
      return;
    }

    setSigning(true);
    try {
      const transaction = {
        validUntil: Math.floor(Date.now() / 1000) + 300,
        messages: [
          {
            address: userAddress,
            amount: toNano('0.01').toString(),
            payload: encodeComment(`Handshake Manifesto Signed: ${pactTitle}`),
          },
        ],
      };

      await tonConnectUI.sendTransaction(transaction);
      setSignedPacts((prev) => new Set(prev).add(pactTitle));
      addSignedPact(pactTitle, userAddress);
      toast.success(`${pactTitle} signed on-chain!`);
    } catch (err: any) {
      if (err?.message?.includes('Cancelled') || err?.message?.includes('canceled')) {
        toast.info('Transaction cancelled');
      } else {
        toast.error(err?.message || 'Transaction failed. Please try again.');
      }
    } finally {
      setSigning(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col px-6">
      {/* Header with sign in */}
      <div className="flex items-center justify-between pt-5 pb-2 w-full max-w-sm mx-auto">
        <div />
        {userAddress ? (
          <span className="text-xs text-muted-foreground font-mono truncate max-w-[120px]">
            {userAddress.slice(0, 6)}...{userAddress.slice(-4)}
          </span>
        ) : (
          <Button
            variant="outline"
            size="sm"
            className="rounded-xl gap-1.5 text-xs h-8"
            onClick={() => openTonModal()}
          >
            <Wallet className="w-3.5 h-3.5" />
            Sign in
          </Button>
        )}
      </div>

      <div className="flex-1 flex flex-col items-center justify-center">
      <motion.div
        className="w-full max-w-sm flex flex-col items-center text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        <h1 className="logo-text text-4xl text-foreground mb-2">Handshake</h1>
        <p className="text-lg font-medium text-foreground/80 mb-6">
          Agreements in the Age of AI
        </p>

        <div className="mb-8 cursor-pointer" onClick={() => window.open('https://t.me/handshakemonsterbot', '_blank')}>
          <Orb state="idle" />
        </div>

        <motion.p
          className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Manifesto
        </motion.p>

        <motion.div
          className="flex items-center justify-center gap-8"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          {PACT_TEMPLATES.map((t) => (
            <PactTemplateOrb
              key={t.label}
              label={t.label}
              colors={t.colors}
              onClick={() => setSelectedTemplate(t)}
            />
          ))}
        </motion.div>
      </motion.div>
      </div>

      {/* Template Detail Dialog */}
      <Dialog open={!!selectedTemplate} onOpenChange={(open) => !open && setSelectedTemplate(null)}>
        <DialogContent
          className="rounded-3xl max-w-sm mx-auto border-0 overflow-hidden"
          style={{
            background: 'hsla(230, 25%, 97%, 0.8)',
            backdropFilter: 'blur(40px)',
            boxShadow: selectedTemplate
              ? `0 0 60px ${selectedTemplate.colors[0]}, 0 0 120px ${selectedTemplate.colors[1]}, 0 20px 60px hsla(230, 25%, 10%, 0.08)`
              : undefined,
            border: '1px solid hsla(218, 90%, 60%, 0.12)',
          }}
        >
          {selectedTemplate && (
            <div className="flex justify-center -mt-2 mb-2">
              <div
                className="relative w-16 h-16 rounded-full overflow-hidden"
                style={{
                  background: `radial-gradient(circle at 35% 35%, ${selectedTemplate.colors[0]}, ${selectedTemplate.colors[1]}, ${selectedTemplate.colors[2]})`,
                  boxShadow: `0 0 40px ${selectedTemplate.colors[0]}, 0 0 80px ${selectedTemplate.colors[1]}`,
                }}
              >
                <motion.div
                  className="absolute rounded-full blur-xl"
                  style={{
                    width: 30, height: 30,
                    background: selectedTemplate.colors[0].replace(/[\d.]+\)$/, '0.6)'),
                    left: '50%', top: '50%',
                    marginLeft: -15, marginTop: -15,
                  }}
                  animate={{ x: [5, -8, 5], y: [3, -5, 3], scale: [1, 1.4, 1] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                />
              </div>
            </div>
          )}

          <DialogHeader>
            <DialogTitle className="text-foreground text-center">{selectedTemplate?.title}</DialogTitle>
          </DialogHeader>

          <div className="space-y-3 pt-2 max-h-[50vh] overflow-y-auto">
            {selectedTemplate?.sections?.map((section, i) => {
              if (section.type === 'subtitle')
                return <p key={i} className="text-sm font-semibold text-foreground/90 text-center italic">{section.text}</p>;
              if (section.type === 'body')
                return <p key={i} className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{section.text}</p>;
              if (section.type === 'heading')
                return <p key={i} className="text-sm font-semibold text-foreground/80 pt-1">{section.text}</p>;
              if (section.type === 'list')
                return (
                  <ul key={i} className="space-y-1.5 pl-1">
                    {section.items?.map((item) => (
                      <li key={item} className="text-sm flex items-center gap-2.5 text-muted-foreground">
                        <span
                          className="w-1.5 h-1.5 rounded-full inline-block flex-shrink-0"
                          style={{ background: selectedTemplate.colors[0].replace(/[\d.]+\)$/, '0.8)') }}
                        />
                        {item}
                      </li>
                    ))}
                  </ul>
                );
              return null;
            })}
          </div>

          {/* Sign Button */}
          {selectedTemplate && (
            <div className="pt-4">
              {signedPacts.has(selectedTemplate.title) ? (
                <Button
                  className="w-full rounded-2xl h-12 text-base font-semibold gap-2 bg-success hover:bg-success/90 text-success-foreground"
                  disabled
                >
                  <Check className="w-4 h-4" />
                  Signed
                </Button>
              ) : (
                <Button
                  className="w-full rounded-2xl h-12 text-base font-semibold gap-2"
                  disabled={signing}
                  onClick={() => handleSign(selectedTemplate.title)}
                >
                  <PenTool className="w-4 h-4" />
                  {signing ? 'Signing...' : !userAddress ? 'Connect Wallet to Sign' : 'Sign with TON'}
                </Button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LoginPage;
