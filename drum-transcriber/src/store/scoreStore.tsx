import { create } from 'zustand';
import type { RenderedNote } from '../types';

interface ScoreState {
  notes: RenderedNote[];
  // Fix: Explicitly say that addNote takes a 'note' argument
  addNote: (note: RenderedNote) => void; 
  clearScore: () => void;
}

export const useScoreStore = create<ScoreState>((set) => ({
  notes: [],

  // Fix: Add the argument here too
  addNote: (note) => set((state) => ({ 
    notes: [...state.notes, note] 
  })),

  clearScore: () => set({ notes: [] }),
}));