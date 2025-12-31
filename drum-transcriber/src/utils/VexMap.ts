import { StaveNote, Articulation } from 'vexflow';
import type { RenderedNote, DrumType } from '../types';

// The Visual Dictionary
const DRUM_PITCHES: Record<DrumType, string> = {
  'kick': 'f/4',           
  'snare': 'c/5',          
  'hihat_closed': 'g/5/X0',
  'hihat_open': 'g/5/X0',  
  'crash': 'a/5/X0',       
  'ride': 'f/5/X0'         
};

export const convertToVexNotes = (notes: RenderedNote[]) => {
  return notes.map((note) => {
    // 1. Collect ALL keys for this chord
    // We map over the array of types (e.g. ['kick', 'crash'] -> ['f/4', 'a/5/X0'])
    const keys = note.types.map(t => DRUM_PITCHES[t] || 'c/5');

    // 2. Create the Note
    const staveNote = new StaveNote({
      clef: "percussion",
      keys: keys, // VexFlow accepts an array of keys automatically!
      duration: note.duration,
      autoStem: true,
    });

    // 3. Handle Articulations (like Hi-Hat Open)
    // We check if ANY of the drums in the chord need the 'o' symbol
    if (note.types.includes('hihat_open')) {
       staveNote.addModifier(new Articulation('a@a').setPosition(3)); 
    }

    return staveNote;
  });
};