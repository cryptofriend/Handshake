import { motion } from 'framer-motion';
import { useState } from 'react';
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
    color: 'hsl(218, 90%, 60%)',
    title: 'Freelance Agreement',
    description:
      'A simple pact for freelance work. Covers task scope, payment terms, deadline, and deliverables between a client and freelancer.',
    fields: ['Task description', 'Payment amount', 'Deadline', 'Deliverables', 'Revision policy'],
  },
  {
    label: 'NDA',
    color: 'hsl(260, 70%, 55%)',
    title: 'Non-Disclosure Agreement',
    description:
      'Protect sensitive information shared between parties. Defines what's confidential, duration of obligation, and consequences of breach.',
    fields: ['Confidential info scope', 'Duration', 'Permitted disclosures', 'Breach remedies'],
  },
  {
    label: 'Split',
    color: 'hsl(190, 80%, 50%)',
    title: 'Revenue Split Agreement',
    description:
      'Define how revenue or profits are divided between collaborators. Covers percentage splits, payment schedule, and reporting.',
    fields: ['Split percentages', 'Revenue source', 'Payment schedule', 'Reporting frequency', 'Duration'],
  },
];

const LoginPage = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<typeof PACT_TEMPLATES[number] | null>(null);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
      <motion.div
        className="w-full max-w-sm flex flex-col items-center text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Logo */}
        <h1 className="logo-text text-4xl text-foreground mb-2">Handshake</h1>

        {/* Headline */}
        <p className="text-lg font-medium text-foreground/80 mb-6">
          Agreements in the Age of AI
        </p>

        {/* Orb */}
        <div className="mb-10">
          <Orb state="idle" />
        </div>

        {/* Pact Template Orbs */}
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
              color={t.color}
              onClick={() => setSelectedTemplate(t)}
            />
          ))}
        </motion.div>
      </motion.div>

      {/* Template Detail Dialog */}
      <Dialog open={!!selectedTemplate} onOpenChange={(open) => !open && setSelectedTemplate(null)}>
        <DialogContent className="rounded-3xl max-w-sm mx-auto">
          <DialogHeader>
            <DialogTitle>{selectedTemplate?.title}</DialogTitle>
            <DialogDescription className="pt-2">
              {selectedTemplate?.description}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 pt-2">
            <p className="text-sm font-medium text-foreground">Fields covered:</p>
            <ul className="space-y-1">
              {selectedTemplate?.fields.map((f) => (
                <li key={f} className="text-sm text-muted-foreground flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block" />
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
