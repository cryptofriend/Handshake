export type AgreementStatus = 'draft' | 'signed_by_one' | 'fully_signed' | 'rejected';

export interface Agreement {
  id: string;
  creatorName: string;
  creatorAvatar?: string;
  counterpartyName: string;
  task: string;
  payment: string;
  deadline: string;
  notes: string;
  creatorSigned: boolean;
  counterpartySigned: boolean;
  creatorSignedAt?: string;
  counterpartySignedAt?: string;
  status: AgreementStatus;
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  username: string;
  avatar?: string;
}
