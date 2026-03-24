export type AgreementStatus = 'draft' | 'pending_signature' | 'signed_by_one' | 'fully_signed' | 'rejected' | 'disputed';

export interface Party {
  name: string;
  role?: string;
  walletAddress?: string;
  signedAt?: string;
  txHash?: string;
}

export interface Allocation {
  party: string;
  percentage: number;
  label?: string;
}

export interface AgreementSignature {
  party: string;
  walletAddress: string;
  signedAt: string;
  txHash: string;
  blockchainStatus: 'pending' | 'confirmed' | 'failed';
}

export interface Agreement {
  id: string;
  version: string;
  createdAt: string;
  title: string;
  summary: string;
  status: AgreementStatus;
  parties: Party[];
  allocations: Allocation[];
  fullText: string;
  shortHash: string;
  fullHash: string;
  signatures: AgreementSignature[];
  receiptStatus: 'none' | 'minting' | 'minted';
  txHash?: string;
  deepLinkSource?: string;
  inviter?: string;
  invitedUser?: string;

  // Legacy compat fields
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
}

export interface User {
  id: string;
  name: string;
  username: string;
  avatar?: string;
}
