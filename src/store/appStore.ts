import { create } from 'zustand';
import { Agreement, User } from '@/types/agreement';

type AppMode = 'human' | 'agent';

interface AppState {
  user: User | null;
  currentAgreement: Agreement | null;
  agreements: Agreement[];
  mode: AppMode;
  setUser: (user: User | null) => void;
  setMode: (mode: AppMode) => void;
  setCurrentAgreement: (agreement: Agreement | null) => void;
  updateAgreement: (updates: Partial<Agreement>) => void;
  addAgreement: (agreement: Agreement) => void;
  signAsCreator: () => void;
  signAsCounterparty: () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  user: null,
  currentAgreement: null,
  agreements: [],
  setUser: (user) => set({ user }),
  setCurrentAgreement: (agreement) => set({ currentAgreement: agreement }),
  updateAgreement: (updates) => set((state) => ({
    currentAgreement: state.currentAgreement 
      ? { ...state.currentAgreement, ...updates } 
      : null,
  })),
  addAgreement: (agreement) => set((state) => ({
    agreements: [agreement, ...state.agreements],
  })),
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
