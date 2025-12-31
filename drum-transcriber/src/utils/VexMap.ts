import { StaveNote, Articulation } from 'vexflow';
import type { RenderedNote, DrumType } from '../types';

// The "Visual Dictionary"
// Format: [Note Name] / [Octave] / [Custom Glyph Code]
// 'X0' is the code for a "Cross" note head (used for cymbals)
const DRUM_PITCHES: Record<DrumType, string[]> = {
  'kick': ['f/4'],           // Standard head
  'snare': ['c/5'],          // Standard head
  'hihat_closed': ['g/5/X0'],// Cross head
  'hihat_open': ['g/5/X0'],  // Cross head
  'crash': ['a/5/X0'],       // Cross head
  'ride': ['f/5/X0']         // Cross head
};

export const convertToVexNotes = (notes: RenderedNote[]) => {
  return notes.map((note) => {
    // 1. Get the pitch keys (including the /X0 suffix if needed)
    const keys = DRUM_PITCHES[note.type] || ['c/5'];

    // 2. Create the Note
    const staveNote = new StaveNote({
      clef: "percussion",
      keys: keys,
      duration: note.duration,
      autoStem: true, // ✅ FIXED: Changed from 'auto_stem'
    });

    // 3. Add "Open" symbol (o) for open hi-hat
    // We don't need to manually set note heads anymore because we did it in step 1!
    if (note.type === 'hihat_open') {
       staveNote.addModifier(new Articulation('a@a').setPosition(3)); 
    }

    return staveNote;
  });
};