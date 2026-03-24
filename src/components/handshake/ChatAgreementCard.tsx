import { motion } from 'framer-motion';
import { AgreementPreview } from '@/types/chat';
import { FileText, AlertCircle, CheckCircle2, Clock, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const statusConfig: Record<string, { label: string; icon: React.ReactNode; className: string }> = {
  needs_clarification: {
    label: 'Needs Clarification',
    icon: <AlertCircle className="w-3 h-3" />,
    className: 'bg-warning/10 text-warning',
  },
  draft_ready: {
    label: 'Draft Ready',
    icon: <Clock className="w-3 h-3" />,
    className: 'bg-primary/10 text-primary',
  },
  sign_ready: {
    label: 'Ready to Sign',
    icon: <CheckCircle2 className="w-3 h-3" />,
    className: 'bg-success/10 text-success',
  },
};

interface Props {
  agreement: AgreementPreview;
}

export const ChatAgreementCard = ({ agreement }: Props) => {
  const navigate = useNavigate();
  const config = statusConfig[agreement.status];

  return (
    <motion.div
      className="mt-3 rounded-2xl overflow-hidden"
      style={{
        background: 'linear-gradient(145deg, hsl(var(--card)) 0%, hsl(var(--orb-blue) / 0.04) 100%)',
        border: '1px solid hsl(var(--orb-blue) / 0.12)',
        boxShadow: '0 0 20px hsl(var(--orb-blue) / 0.04), 0 4px 16px hsl(var(--orb-blue) / 0.03)',
      }}
      initial={{ opacity: 0, y: 8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary" />
            <span className="text-xs font-semibold text-foreground">{agreement.title}</span>
          </div>
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${config.className}`}>
            {config.icon}
            {config.label}
          </span>
        </div>

        {/* Summary */}
        <p className="text-xs text-muted-foreground mb-3 leading-relaxed">{agreement.summary}</p>

        {/* Parties */}
        <div className="flex items-center gap-1 mb-2">
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground/70">Parties</span>
        </div>
        <div className="flex flex-wrap gap-1.5 mb-3">
          {agreement.parties.map((party) => (
            <span
              key={party}
              className="text-[11px] px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground font-medium"
            >
              {party}
            </span>
          ))}
        </div>

        {/* Key Terms */}
        {Object.keys(agreement.keyTerms).length > 0 && (
          <div className="space-y-1.5 mb-3">
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground/70">Key Terms</span>
            <div className="grid gap-1">
              {Object.entries(agreement.keyTerms).map(([key, value]) => (
                <div key={key} className="flex justify-between text-xs">
                  <span className="text-muted-foreground">{key}</span>
                  <span className="text-foreground font-medium">{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Missing Fields */}
        {agreement.missingFields && agreement.missingFields.length > 0 && (
          <div className="rounded-xl bg-warning/5 border border-warning/10 p-2.5 mb-3">
            <div className="flex items-center gap-1.5 mb-1.5">
              <AlertCircle className="w-3 h-3 text-warning" />
              <span className="text-[10px] font-semibold text-warning">Missing Information</span>
            </div>
            <ul className="space-y-0.5">
              {agreement.missingFields.map((field) => (
                <li key={field} className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-warning/50 flex-shrink-0" />
                  {field}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Open Agreement CTA */}
        {agreement.openAgreementUrl && (
          <Button
            className="w-full rounded-xl h-10 text-sm font-semibold gap-2 mt-1"
            onClick={() => navigate(agreement.openAgreementUrl!)}
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Open Agreement
          </Button>
        )}
      </div>
    </motion.div>
  );
};
