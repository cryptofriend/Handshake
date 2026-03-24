import { useState } from 'react';
import { motion } from 'framer-motion';
import { Agreement } from '@/types/agreement';
import { RotateCw } from 'lucide-react';

interface Props {
  agreement: Agreement;
}

export const AgreementCardFlip = ({ agreement }: Props) => {
  const [flipped, setFlipped] = useState(false);

  return (
    <div className="perspective-[1200px] w-full">
      <motion.div
        className="relative w-full cursor-pointer"
        style={{ transformStyle: 'preserve-3d' }}
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        onClick={() => setFlipped(!flipped)}
      >
        {/* Front */}
        <div
          className="w-full rounded-3xl p-6 border border-border/50"
          style={{
            backfaceVisibility: 'hidden',
            background: 'linear-gradient(145deg, hsl(var(--card)) 0%, hsl(var(--orb-blue) / 0.06) 50%, hsl(var(--orb-purple) / 0.04) 100%)',
            boxShadow: '0 0 40px hsl(var(--orb-blue) / 0.08), 0 0 80px hsl(var(--orb-purple) / 0.04), 0 8px 32px hsl(var(--orb-blue) / 0.06)',
            border: '1px solid hsl(var(--orb-blue) / 0.12)',
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-medium tracking-widest uppercase text-muted-foreground">
              Handshake Agreement
            </span>
            <RotateCw className="w-3.5 h-3.5 text-muted-foreground/50" />
          </div>

          <h3 className="text-lg font-semibold text-foreground mb-1">{agreement.title}</h3>
          <p className="text-sm text-muted-foreground mb-4">{agreement.summary}</p>

          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Parties</span>
              <span className="text-foreground font-medium">
                {agreement.parties.map(p => p.name).join(' & ')}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Effective</span>
              <span className="text-foreground font-medium">
                {new Date(agreement.createdAt).toLocaleDateString()}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Version</span>
              <span className="text-foreground font-medium">v{agreement.version}</span>
            </div>
          </div>

          {/* Allocations */}
          {agreement.allocations.length > 0 && (
            <div className="mb-4">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Ownership</p>
              <div className="flex gap-2">
                {agreement.allocations.map((a) => (
                  <div
                    key={a.party}
                    className="flex-1 rounded-xl bg-background/60 p-2.5 text-center"
                  >
                    <p className="text-sm font-semibold text-foreground">{a.percentage}%</p>
                    <p className="text-[10px] text-muted-foreground">{a.label || a.party}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Signature slots */}
          <div className="flex gap-3 mb-3">
            {agreement.parties.map((party) => {
              const sig = agreement.signatures.find(s => s.party === party.name);
              return (
                <div
                  key={party.name}
                  className="flex-1 rounded-xl border border-border/50 p-2.5 text-center"
                  style={{
                    background: sig
                      ? 'hsl(var(--success) / 0.06)'
                      : 'hsl(var(--muted) / 0.3)',
                  }}
                >
                  <p className="text-[10px] text-muted-foreground mb-0.5">
                    {party.name}
                  </p>
                  {sig ? (
                    <p className="text-[10px] font-medium text-success">✓ Signed</p>
                  ) : (
                    <p className="text-[10px] text-muted-foreground/50">Pending</p>
                  )}
                </div>
              );
            })}
          </div>

          {/* Fingerprint */}
          <div className="flex items-center justify-center gap-1.5 pt-2 border-t border-border/30">
            <span className="text-[9px] font-mono text-muted-foreground/60">
              {agreement.shortHash}
            </span>
          </div>
        </div>

        {/* Back */}
        <div
          className="absolute inset-0 w-full rounded-3xl p-6 border border-border/50"
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            background: 'linear-gradient(135deg, hsl(var(--secondary)) 0%, hsl(var(--card)) 100%)',
            boxShadow: 'var(--shadow-elevated)',
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-medium tracking-widest uppercase text-muted-foreground">
              Agreement Details
            </span>
            <RotateCw className="w-3.5 h-3.5 text-muted-foreground/50" />
          </div>

          <div className="space-y-3 text-xs">
            {agreement.parties.map((party) => (
              <div key={party.name} className="flex justify-between">
                <span className="text-muted-foreground">{party.name}</span>
                <span className="text-foreground font-medium">{party.role || 'Party'}</span>
              </div>
            ))}

            <div className="pt-2 border-t border-border/30">
              <p className="text-muted-foreground mb-1">Full Hash</p>
              <p className="font-mono text-[10px] text-foreground/70 break-all">
                {agreement.fullHash}
              </p>
            </div>

            <div className="pt-2 border-t border-border/30">
              <p className="text-muted-foreground mb-1">Receipt</p>
              <p className="text-foreground font-medium capitalize">{agreement.receiptStatus}</p>
            </div>

            {agreement.txHash && (
              <div className="pt-2 border-t border-border/30">
                <p className="text-muted-foreground mb-1">Transaction</p>
                <p className="font-mono text-[10px] text-primary break-all">{agreement.txHash}</p>
              </div>
            )}
          </div>

          <div className="flex items-center justify-center gap-1.5 pt-3 mt-auto border-t border-border/30">
            <span className="text-[9px] font-mono text-muted-foreground/60">Tap to flip</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
