import { create } from 'zustand';
import { Agreement, User } from '@/types/agreement';
import { ChatMessage, ChatConversation } from '@/types/chat';

type AppMode = 'human' | 'agent';

interface AppState {
  user: User | null;
  currentAgreement: Agreement | null;
  agreements: Agreement[];
  signedPacts: Set<string>;
  mode: AppMode;
  chatConversation: ChatConversation | null;
  setUser: (user: User | null) => void;
  setMode: (mode: AppMode) => void;
  setCurrentAgreement: (agreement: Agreement | null) => void;
  updateAgreement: (updates: Partial<Agreement>) => void;
  addAgreement: (agreement: Agreement) => void;
  addSignedPact: (pactTitle: string, walletAddress: string, txHash?: string) => void;
  addChatMessage: (message: ChatMessage) => void;
  clearChat: () => void;
  signAsCreator: () => void;
  signAsCounterparty: () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  user: null,
  currentAgreement: null,
  agreements: [],
  signedPacts: new Set<string>(),
  mode: 'human',
  chatConversation: null,
  setUser: (user) => set({ user }),
  setMode: (mode) => set({ mode }),
  setCurrentAgreement: (agreement) => set({ currentAgreement: agreement }),
  updateAgreement: (updates) => set((state) => ({
    currentAgreement: state.currentAgreement 
      ? { ...state.currentAgreement, ...updates } 
      : null,
  })),
  addAgreement: (agreement) => set((state) => ({
    agreements: [agreement, ...state.agreements],
  })),
  addSignedPact: (pactTitle, walletAddress, txHash) => set((state) => {
    const newSignedPacts = new Set(state.signedPacts);
    newSignedPacts.add(pactTitle);

    // Create an agreement entry for the signed manifesto
    const manifestoAgreement: Agreement = {
      id: `manifesto-${pactTitle.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
      version: '1.0',
      createdAt: new Date().toISOString(),
      title: `Manifesto: ${pactTitle}`,
      summary: `Signed the ${pactTitle} manifesto pact on-chain.`,
      status: 'fully_signed',
      parties: [{ name: walletAddress.slice(0, 6) + '...' + walletAddress.slice(-4), role: 'Signer', walletAddress }],
      allocations: [],
      fullText: `Handshake Manifesto – ${pactTitle}`,
      shortHash: txHash ? txHash.slice(0, 10) : '0x...',
      fullHash: txHash || '',
      signatures: [{
        party: walletAddress.slice(0, 6) + '...' + walletAddress.slice(-4),
        walletAddress,
        signedAt: new Date().toISOString(),
        txHash: txHash || '',
        blockchainStatus: 'confirmed',
      }],
      receiptStatus: 'minted',
      txHash,
      creatorName: walletAddress.slice(0, 6) + '...' + walletAddress.slice(-4),
      counterpartyName: 'Handshake Protocol',
      task: `Sign ${pactTitle} manifesto`,
      payment: '0.01 TON',
      deadline: '',
      notes: '',
      creatorSigned: true,
      counterpartySigned: true,
      creatorSignedAt: new Date().toISOString(),
      counterpartySignedAt: new Date().toISOString(),
    };

    return {
      signedPacts: newSignedPacts,
      agreements: [manifestoAgreement, ...state.agreements],
    };
  }),
  addChatMessage: (message) => set((state) => {
    const conv = state.chatConversation || {
      id: crypto.randomUUID(),
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return {
      chatConversation: {
        ...conv,
        messages: [...conv.messages, message],
        updatedAt: new Date().toISOString(),
      },
    };
  }),
  clearChat: () => set({ chatConversation: null }),
  signAsCreator: () => set((state) => {
    if (!state.currentAgreement) return state;
    const updated = {
      ...state.currentAgreement,
      creatorSigned: true,
      creatorSignedAt: new Date().toISOString(),
      status: state.currentAgreement.counterpartySigned 
        ? 'fully_signed' as const 
        : 'signed_by_one' as const,
    };
    return {
      currentAgreement: updated,
      agreements: state.agreements.map(a => a.id === updated.id ? updated : a),
    };
  }),
  signAsCounterparty: () => set((state) => {
    if (!state.currentAgreement) return state;
    const updated = {
      ...state.currentAgreement,
      counterpartySigned: true,
      counterpartySignedAt: new Date().toISOString(),
      status: state.currentAgreement.creatorSigned 
        ? 'fully_signed' as const 
        : 'signed_by_one' as const,
    };
    return {
      currentAgreement: updated,
      agreements: state.agreements.map(a => a.id === updated.id ? updated : a),
    };
  }),
}));
