import { motion } from 'framer-motion';
import { Agreement } from '@/types/agreement';
import { StatusBadge } from './StatusBadge';
import { FileText, User, DollarSign, Calendar, StickyNote } from 'lucide-react';

interface AgreementCardProps {
  agreement: Agreement;
  compact?: boolean;
}

const Field = ({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) => (
  <div className="flex items-start gap-3 py-2">
    <Icon className="w-4 h-4 text-primary mt-0.5 shrink-0" />
    <div className="min-w-0">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium text-foreground">{value}</p>
    </div>
  </div>
);

export const AgreementCard = ({ agreement, compact }: AgreementCardProps) => {
  return (
    <motion.div
      className="card-handshake w-full"
      initial={{ y: 40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">Agreement Summary</h3>
        <StatusBadge status={agreement.status} />
      </div>

      <div className={`divide-y divide-border ${compact ? 'space-y-0' : ''}`}>
        <Field icon={User} label="Party A" value={agreement.creatorName} />
        <Field icon={User} label="Party B" value={agreement.counterpartyName} />
        <Field icon={FileText} label="Task / Deliverable" value={agreement.task} />
        <Field icon={DollarSign} label="Payment" value={agreement.payment} />
        <Field icon={Calendar} label="Deadline" value={agreement.deadline} />
        {agreement.notes && <Field icon={StickyNote} label="Notes" value={agreement.notes} />}
      </div>

      {(agreement.creatorSigned || agreement.counterpartySigned) && (
        <div className="mt-4 pt-4 border-t border-border space-y-2">
          {agreement.creatorSigned && (
            <div className="flex items-center gap-2 text-xs">
              <div className="w-2 h-2 rounded-full bg-success" />
              <span className="text-success font-medium">{agreement.creatorName} signed</span>
              <span className="text-muted-foreground">
                {agreement.creatorSignedAt && new Date(agreement.creatorSignedAt).toLocaleString()}
              </span>
            </div>
          )}
          {agreement.counterpartySigned && (
            <div className="flex items-center gap-2 text-xs">
              <div className="w-2 h-2 rounded-full bg-success" />
              <span className="text-success font-medium">{agreement.counterpartyName} signed</span>
              <span className="text-muted-foreground">
                {agreement.counterpartySignedAt && new Date(agreement.counterpartySignedAt).toLocaleString()}
              </span>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
};
