import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AgentTerm, TermType } from '@/types/agentMode';

interface TermEditorProps {
  terms: AgentTerm[];
  onChange: (terms: AgentTerm[]) => void;
}

export const TermEditor = ({ terms, onChange }: TermEditorProps) => {
  const addTerm = () => {
    onChange([...terms, { id: crypto.randomUUID(), type: 'constraint', rule: '' }]);
  };

  const removeTerm = (id: string) => {
    onChange(terms.filter(t => t.id !== id));
  };

  const updateTerm = (id: string, updates: Partial<AgentTerm>) => {
    onChange(terms.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  return (
    <div className="space-y-2">
      <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Terms</label>
      {terms.map((term) => (
        <div key={term.id} className="flex items-start gap-2 p-2 rounded-md border border-border bg-muted/30">
          <Select
            value={term.type}
            onValueChange={(v: TermType) => {
              const updates: Partial<AgentTerm> = { type: v };
              if (v === 'constraint') { updates.action = undefined; updates.frequency = undefined; updates.rule = ''; }
              if (v === 'task') { updates.rule = undefined; updates.action = ''; }
              updateTerm(term.id, updates);
            }}
          >
            <SelectTrigger className="w-28 h-8 text-xs font-mono">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="constraint">constraint</SelectItem>
              <SelectItem value="task">task</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex-1 space-y-1">
            {term.type === 'constraint' ? (
              <Input
                placeholder="rule..."
                value={term.rule || ''}
                onChange={e => updateTerm(term.id, { rule: e.target.value })}
                className="h-8 text-xs font-mono bg-background"
              />
            ) : (
              <>
                <Input
                  placeholder="action..."
                  value={term.action || ''}
                  onChange={e => updateTerm(term.id, { action: e.target.value })}
                  className="h-8 text-xs font-mono bg-background"
                />
                <Input
                  placeholder="frequency (optional)"
                  value={term.frequency || ''}
                  onChange={e => updateTerm(term.id, { frequency: e.target.value })}
                  className="h-8 text-xs font-mono bg-background"
                />
              </>
            )}
          </div>

          <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => removeTerm(term.id)}>
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      ))}
      <Button size="sm" variant="outline" onClick={addTerm} className="text-xs h-7 gap-1 font-mono">
        <Plus className="w-3 h-3" /> Add Term
      </Button>
    </div>
  );
};
