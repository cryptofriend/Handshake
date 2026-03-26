import { useState } from 'react';
import { Bot, ArrowRight, Zap, FileJson, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AgentOnboardingProps {
  onContinue: () => void;
}

export const AgentOnboarding = ({ onContinue }: AgentOnboardingProps) => {
  const [hoveredStep, setHoveredStep] = useState<number | null>(null);

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] px-5 py-10 bg-background">
      {/* Hero */}
      <div className="text-center space-y-3 mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/5 text-primary text-xs font-mono">
          <Bot className="w-3.5 h-3.5" /> Agent Mode
        </div>
        <h1 className="text-2xl font-semibold text-foreground tracking-tight">
          Agreements for <span className="text-primary">AI Agents</span>
        </h1>
        <p className="text-sm text-muted-foreground max-w-xs mx-auto">
          Create, sign, and execute structured agreements between autonomous agents. JSON is the source of truth.
        </p>
      </div>

      {/* Terminal-style skill card */}
      <div className="w-full max-w-sm rounded-xl border border-border bg-card p-5 space-y-4">
        <h2 className="text-sm font-semibold text-foreground text-center">How it works 🤖</h2>

        <div className="rounded-lg bg-muted/50 border border-border p-3">
          <code className="text-[11px] font-mono text-primary leading-relaxed block">
            POST handshake.monster/create<br />
            <span className="text-muted-foreground">{'{'} intent, terms, participants {'}'}</span>
          </code>
        </div>

        <div className="space-y-3">
          {[
            { icon: Zap, num: 1, text: 'Connect your agent identity & wallet' },
            { icon: FileJson, num: 2, text: 'Define terms as structured JSON constraints & tasks' },
            { icon: Shield, num: 3, text: 'Sign on-chain, share via link or API call' },
          ].map((step) => (
            <div
              key={step.num}
              className="flex items-start gap-3 group"
              onMouseEnter={() => setHoveredStep(step.num)}
              onMouseLeave={() => setHoveredStep(null)}
            >
              <span className={`text-xs font-mono font-bold mt-0.5 transition-colors ${
                hoveredStep === step.num ? 'text-primary' : 'text-muted-foreground'
              }`}>
                {step.num}.
              </span>
              <p className={`text-xs transition-colors ${
                hoveredStep === step.num ? 'text-foreground' : 'text-muted-foreground'
              }`}>
                {step.text}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <Button
        onClick={onContinue}
        className="mt-6 gap-2 font-mono text-xs rounded-xl px-6"
      >
        Launch Agent Builder <ArrowRight className="w-3.5 h-3.5" />
      </Button>

      <p className="mt-3 text-[10px] text-muted-foreground font-mono">
        No API key required for MVP
      </p>
    </div>
  );
};
