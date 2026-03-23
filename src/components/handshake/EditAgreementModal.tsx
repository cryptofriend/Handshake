import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Agreement } from '@/types/agreement';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface EditAgreementModalProps {
  agreement: Agreement;
  open: boolean;
  onClose: () => void;
  onSave: (updates: Partial<Agreement>) => void;
}

export const EditAgreementModal = ({ agreement, open, onClose, onSave }: EditAgreementModalProps) => {
  const [form, setForm] = useState({
    counterpartyName: agreement.counterpartyName,
    task: agreement.task,
    payment: agreement.payment,
    deadline: agreement.deadline,
    notes: agreement.notes,
  });

  const handleSave = () => {
    onSave(form);
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-deep-blue/40 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            className="relative w-full max-w-md mx-4 bg-card rounded-t-3xl sm:rounded-3xl p-6 max-h-[85vh] overflow-y-auto"
            style={{ boxShadow: 'var(--shadow-elevated)' }}
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-foreground">Edit Agreement</h2>
              <button onClick={onClose} className="p-2 rounded-xl hover:bg-muted transition-colors">
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Party B</label>
                <Input
                  value={form.counterpartyName}
                  onChange={(e) => setForm(f => ({ ...f, counterpartyName: e.target.value }))}
                  className="rounded-xl"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Task / Deliverable</label>
                <Textarea
                  value={form.task}
                  onChange={(e) => setForm(f => ({ ...f, task: e.target.value }))}
                  className="rounded-xl min-h-[80px]"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Payment</label>
                <Input
                  value={form.payment}
                  onChange={(e) => setForm(f => ({ ...f, payment: e.target.value }))}
                  className="rounded-xl"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Deadline</label>
                <Input
                  value={form.deadline}
                  onChange={(e) => setForm(f => ({ ...f, deadline: e.target.value }))}
                  className="rounded-xl"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Notes</label>
                <Textarea
                  value={form.notes}
                  onChange={(e) => setForm(f => ({ ...f, notes: e.target.value }))}
                  className="rounded-xl min-h-[80px]"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button variant="outline" onClick={onClose} className="flex-1 rounded-2xl h-12">
                Cancel
              </Button>
              <Button onClick={handleSave} className="flex-1 rounded-2xl h-12">
                Save Changes
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
