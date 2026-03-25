import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, FileCheck, Share2, ChevronLeft, ChevronRight } from 'lucide-react';
import showcaseTalkAgent from '@/assets/showcase-talk-agent.jpg';
import showcaseReviewSign from '@/assets/showcase-review-sign.png';
import showcaseShareTelegram from '@/assets/showcase-share-telegram.png';

const steps = [
  {
    step: '01',
    icon: MessageSquare,
    title: 'Talk to Agent',
    description: 'Describe your agreement in plain language. Our AI agent understands context and drafts it for you.',
    image: showcaseTalkAgent,
    accent: 'hsla(45, 90%, 55%)',
  },
  {
    step: '02',
    icon: FileCheck,
    title: 'Review & Sign',
    description: 'Review the generated agreement, then sign on-chain with your TON wallet in one tap.',
    image: showcaseReviewSign,
    accent: 'hsla(260, 70%, 55%)',
  },
  {
    step: '03',
    icon: Share2,
    title: 'Share with Friends',
    description: 'Send the agreement link via Telegram. Your counterparty signs and both get blockchain confirmation.',
    image: showcaseShareTelegram,
    accent: 'hsla(200, 80%, 50%)',
  },
];

const INTERVAL = 3000;

export default function ShowcaseSteps() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  const next = useCallback(() => {
    setActive(prev => (prev + 1) % steps.length);
  }, []);

  useEffect(() => {
    if (paused) return;
    const timer = setInterval(next, INTERVAL);
    return () => clearInterval(timer);
  }, [paused, next]);

  const current = steps[active];
  const Icon = current.icon;

  return (
    <div
      className="w-full max-w-lg mx-auto px-5 pb-16"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={() => setPaused(true)}
      onTouchEnd={() => setPaused(false)}
    >
      {/* Section header */}
      <motion.div
        className="text-center mb-8"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-2">How it works</p>
        <h2 className="text-2xl font-semibold text-foreground">Digital Handshake in 3 Steps</h2>
      </motion.div>

      {/* Slide card with nav arrows */}
      <div className="relative">
        {/* Left arrow */}
        <button
          onClick={() => setActive((active - 1 + steps.length) % steps.length)}
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 z-10 w-8 h-8 rounded-full bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-all shadow-sm"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        {/* Right arrow */}
        <button
          onClick={() => setActive((active + 1) % steps.length)}
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-10 w-8 h-8 rounded-full bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-all shadow-sm"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      <div className="relative rounded-3xl overflow-hidden border border-border bg-card" style={{ minHeight: 380 }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
          >
            {/* Image */}
            <div className="relative aspect-[4/3] overflow-hidden">
              <img
                src={current.image}
                alt={current.title}
                width={800}
                height={600}
                className="w-full h-full object-cover"
              />
              {/* Step badge */}
              <div
                className="absolute top-4 left-4 w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold backdrop-blur-md border border-border bg-card/70 text-foreground"
              >
                {current.step}
              </div>
            </div>

            {/* Content */}
            <div className="p-5">
              <div className="flex items-center gap-3 mb-2">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ background: `${current.accent} / 0.2)` }}
                >
                  <Icon className="w-4 h-4 text-foreground" />
                </div>
                <h3 className="text-base font-semibold text-foreground">{current.title}</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{current.description}</p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
      </div>

      {/* Progress dots */}
      <div className="flex items-center justify-center gap-2 mt-5">
        {steps.map((s, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className="relative h-1.5 rounded-full transition-all duration-300"
            style={{ width: i === active ? 32 : 8, background: i === active ? current.accent : 'hsl(var(--muted))' }}
          >
            {i === active && !paused && (
              <motion.div
                className="absolute inset-0 rounded-full origin-left"
                style={{ background: `${current.accent}` }}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: INTERVAL / 1000, ease: 'linear' }}
                key={`progress-${active}`}
              />
            )}
          </button>
        ))}
      </div>

      {/* Bottom tag */}
      <p className="text-center text-xs tracking-widest uppercase text-muted-foreground mt-8">
        Powered by TON blockchain
      </p>
    </div>
  );
}
