export interface AgentIdentity {
  agent_id: string;
  owner: string;
  capabilities: string[];
  endpoint: string;
}

export type TermType = 'constraint' | 'task';

export interface AgentTerm {
  id: string;
  type: TermType;
  rule?: string;
  action?: string;
  frequency?: string;
}

export type IntentType = 'collaborate' | 'data_sharing' | 'non_aggression' | 'custom';
export type DurationType = '1_day' | '7_days' | '30_days' | 'custom';

export interface AgentAgreementPayload {
  title: string;
  participants: string[];
  intent: IntentType;
  terms: AgentTerm[];
  duration: DurationType;
  custom_duration?: string;
  created_at: string;
  signature_required: boolean;
}

export interface AgentAgreementSigned extends AgentAgreementPayload {
  agreement_id: string;
  signatures: {
    agent_id: string;
    wallet_address: string;
    signed_at: string;
    tx_hash: string;
  }[];
  status: 'pending_counterparty' | 'fully_signed' | 'executed';
}
