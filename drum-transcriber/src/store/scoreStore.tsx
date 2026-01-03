import { create } from 'zustand';
import type { RenderedNote } from '../types';
import { fetchNotes, clearAllNotes } from '../api/api';

interface ScoreState {
  notes: RenderedNote[];
  // Fix: Explicitly say that addNote takes a 'note' argument
  addNote: (note: RenderedNote) => void;
  clearScore: () => void;
  loadNotesFromBackend: () => Promise<void>;
}

export const useScoreStore = create<ScoreState>((set) => ({
  notes: [],

  addNote: (note) => set((state) => ({
    notes: [...state.notes, note]
  })),

  clearScore: () => {
    set({ notes: [] });

    clearAllNotes()
      .catch(error => {
        console.error('Error clearing backend:', error);
      });
  },

  loadNotesFromBackend: async () => {
    const fetchedNotes = await fetchNotes();
    if (fetchedNotes && fetchedNotes.length > 0) {
      set({ notes: fetchedNotes });
    }
  },
}));