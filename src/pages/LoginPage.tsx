import { motion } from 'framer-motion';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Orb } from '@/components/handshake/Orb';
import { PactTemplateOrb } from '@/components/handshake/PactTemplateOrb';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

const PACT_TEMPLATES = [
  {
    label: 'Freelance',
    colors: ['hsla(218, 90%, 60%, 0.15)', 'hsla(240, 70%, 50%, 0.1)', 'hsla(200, 80%, 45%, 0.08)'] as [string, string, string],
    title: 'Freelance Agreement',
    description:
      'A simple pact for freelance work. Covers task scope, payment terms, deadline, and deliverables between a client and freelancer.',
    fields: ['Task description', 'Payment amount', 'Deadline', 'Deliverables', 'Revision policy'],
  },
  {
    label: 'NDA',
    colors: ['hsla(260, 70%, 55%, 0.15)', 'hsla(280, 60%, 50%, 0.1)', 'hsla(300, 50%, 55%, 0.08)'] as [string, string, string],
    title: 'Non-Disclosure Agreement',
    description:
      'Protect sensitive information shared between parties. Defines what is confidential, duration of obligation, and consequences of breach.',
    fields: ['Confidential info scope', 'Duration', 'Permitted disclosures', 'Breach remedies'],
  },
  {
    label: 'Split',
    colors: ['hsla(190, 80%, 50%, 0.15)', 'hsla(170, 70%, 45%, 0.1)', 'hsla(210, 60%, 55%, 0.08)'] as [string, string, string],
    title: 'Revenue Split Agreement',
    description:
      'Define how revenue or profits are divided between collaborators. Covers percentage splits, payment schedule, and reporting.',
    fields: ['Split percentages', 'Revenue source', 'Payment schedule', 'Reporting frequency', 'Duration'],
  },
];

const LoginPage = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<typeof PACT_TEMPLATES[number] | null>(null);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
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

        {/* Orb - navigates to agent chat */}
        <div className="mb-8 cursor-pointer" onClick={() => navigate('/agent')}>
          <Orb state="idle" />
        </div>

        <motion.p
          className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Default Pacts
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

      {/* Template Detail Dialog — light glassmorphic */}
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
            <DialogDescription className="pt-2 text-center text-muted-foreground">
              {selectedTemplate?.description}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 pt-2">
            <p className="text-sm font-medium text-foreground/80">Fields covered:</p>
            <ul className="space-y-1.5">
              {selectedTemplate?.fields.map((f) => (
                <li key={f} className="text-sm flex items-center gap-2.5 text-muted-foreground">
                  <span
                    className="w-1.5 h-1.5 rounded-full inline-block flex-shrink-0"
                    style={{ background: selectedTemplate.colors[0].replace(/[\d.]+\)$/, '0.8)') }}
                  />
                  {f}
                </li>
              ))}
            </ul>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LoginPage;
