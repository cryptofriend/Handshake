import { motion } from 'framer-motion';
import { MessageSquare, FileText, Send, CheckCheck } from 'lucide-react';
import showcaseChat from '@/assets/showcase-chat.jpg';
import showcaseAgreement from '@/assets/showcase-agreement.jpg';
import showcaseSign from '@/assets/showcase-sign.jpg';
import showcaseComplete from '@/assets/showcase-complete.jpg';

const steps = [
  {
    step: '01',
    icon: MessageSquare,
    title: 'Talk to AI',
    description: 'Describe your agreement in plain language. Our AI agent understands context, asks clarifying questions, and structures your intent into a proper agreement.',
    image: showcaseChat,
    accent: 'hsla(45, 90%, 55%, 0.15)',
    accentBorder: 'hsla(45, 90%, 55%, 0.25)',
  },
  {
    step: '02',
    icon: FileText,
    title: 'AI Generates Agreement',
    description: 'The agent drafts a complete, structured agreement with identified parties, terms, and conditions — ready for review and signing.',
    image: showcaseAgreement,
    accent: 'hsla(260, 70%, 55%, 0.15)',
    accentBorder: 'hsla(260, 70%, 55%, 0.25)',
  },
  {
    step: '03',
    icon: Send,
    title: 'Sign & Share via Telegram',
    description: 'Sign the agreement on-chain with your TON wallet. Share the signing link instantly via Telegram to your counterparty.',
    image: showcaseSign,
    accent: 'hsla(190, 80%, 50%, 0.15)',
    accentBorder: 'hsla(190, 80%, 50%, 0.25)',
  },
  {
    step: '04',
    icon: CheckCheck,
    title: 'Countersign & Confirm',
    description: 'The other party opens the link, reviews the agreement, and signs. Both parties receive instant confirmation — fully verified on the blockchain.',
    image: showcaseComplete,
    accent: 'hsla(160, 70%, 42%, 0.15)',
    accentBorder: 'hsla(160, 70%, 42%, 0.25)',
  },
];

export default function ShowcaseSteps() {
  return (
    <div className="w-full max-w-2xl mx-auto px-5 pb-20">
      {/* Section header */}
      <motion.div
        className="text-center mb-12"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ duration: 0.6 }}
      >
        <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-2">How it works</p>
        <h2 className="text-2xl font-semibold text-foreground">Agreement in 4 steps</h2>
      </motion.div>

      {/* Steps */}
      <div className="space-y-16">
        {steps.map((s, i) => {
          const Icon = s.icon;
          const isEven = i % 2 === 0;

          return (
            <motion.div
              key={s.step}
              className="relative"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              {/* Connector line */}
              {i < steps.length - 1 && (
                <div className="absolute left-1/2 -translate-x-px bottom-0 translate-y-full h-16 w-px bg-gradient-to-b from-border to-transparent" />
              )}

              {/* Card */}
              <div
                className="rounded-3xl overflow-hidden border"
                style={{
                  background: s.accent,
                  borderColor: s.accentBorder,
                }}
              >
                {/* Image */}
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={s.image}
                    alt={s.title}
                    loading="lazy"
                    width={800}
                    height={600}
                    className="w-full h-full object-cover"
                  />
                  {/* Step badge */}
                  <div
                    className="absolute top-4 left-4 w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold backdrop-blur-md border"
                    style={{
                      background: s.accent,
                      borderColor: s.accentBorder,
                      color: 'hsl(var(--foreground))',
                    }}
                  >
                    {s.step}
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center"
                      style={{ background: s.accentBorder }}
                    >
                      <Icon className="w-4.5 h-4.5 text-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">{s.title}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{s.description}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Bottom CTA */}
      <motion.div
        className="text-center mt-16"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <p className="text-xs tracking-widest uppercase text-muted-foreground">
          Powered by TON blockchain
        </p>
      </motion.div>
    </div>
  );
}
