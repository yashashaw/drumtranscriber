import { create } from 'zustand';
import type { RenderedNote } from '../types';
import axios from 'axios';

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

  clearScore: () => {
    set({ notes: [] });
    
    // Clear backend too
    axios.delete("http://localhost:5000/api/notes").catch(error => {
      console.error('Error clearing backend:', error);
    });
  },
}));