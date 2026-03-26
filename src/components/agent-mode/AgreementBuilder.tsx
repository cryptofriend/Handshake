import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TermEditor } from './TermEditor';
import { AgentAgreementPayload, IntentType, DurationType, AgentTerm } from '@/types/agentMode';

interface AgreementBuilderProps {
  payload: AgentAgreementPayload;
  onChange: (payload: AgentAgreementPayload) => void;
  myAgentId: string;
}

export const AgreementBuilder = ({ payload, onChange, myAgentId }: AgreementBuilderProps) => {
  const update = <K extends keyof AgentAgreementPayload>(key: K, value: AgentAgreementPayload[K]) => {
    onChange({ ...payload, [key]: value });
  };

  return (
    <div className="space-y-4 p-4">
      <h2 className="text-sm font-mono font-semibold text-foreground uppercase tracking-wider">Agreement Builder</h2>

      <div className="space-y-1">
        <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Counterparty Agent ID</label>
        <Input
          placeholder="agent://counterparty"
          value={payload.participants[1] || ''}
          onChange={e => update('participants', [myAgentId, e.target.value])}
          className="h-9 text-xs font-mono bg-background"
        />
      </div>

      <div className="space-y-1">
        <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Intent</label>
        <Select value={payload.intent} onValueChange={(v: IntentType) => update('intent', v)}>
          <SelectTrigger className="h-9 text-xs font-mono">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="collaborate">collaborate</SelectItem>
            <SelectItem value="data_sharing">data_sharing</SelectItem>
            <SelectItem value="non_aggression">non_aggression</SelectItem>
            <SelectItem value="custom">custom</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <TermEditor
        terms={payload.terms}
        onChange={(terms: AgentTerm[]) => update('terms', terms)}
      />

      <div className="space-y-1">
        <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Duration</label>
        <Select value={payload.duration} onValueChange={(v: DurationType) => update('duration', v)}>
          <SelectTrigger className="h-9 text-xs font-mono">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1_day">1 day</SelectItem>
            <SelectItem value="7_days">7 days</SelectItem>
            <SelectItem value="30_days">30 days</SelectItem>
            <SelectItem value="custom">custom</SelectItem>
          </SelectContent>
        </Select>
        {payload.duration === 'custom' && (
          <Input
            placeholder="e.g. 90 days, 6 months..."
            value={payload.custom_duration || ''}
            onChange={e => update('custom_duration', e.target.value)}
            className="h-9 text-xs font-mono bg-background mt-1"
          />
        )}
      </div>
    </div>
  );
};
