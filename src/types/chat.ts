export type HandshakeStatus = 'needs_clarification' | 'draft_ready' | 'sign_ready';

export interface AgreementPreview {
  id: string;
  title: string;
  summary: string;
  parties: string[];
  keyTerms: Record<string, string>;
  missingFields?: string[];
  status: HandshakeStatus;
  openAgreementUrl?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'agent';
  content: string;
  timestamp: string;
  // Structured response data from Handshake
  handshakeStatus?: HandshakeStatus;
  agreement?: AgreementPreview;
  agreementId?: string;
}

export interface ChatConversation {
  id: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}
