import { create } from 'zustand';

// A "Mock" store that always returns an empty list of notes
export const useScoreStore = create(() => ({
  notes: [], // Empty for now
  addNote: () => {}, 
  clearScore: () => {}, 
}));