import type { DrumType } from '../types';

export const MIDI_TO_DRUM: Record<number, DrumType> = {
  // Kick
  35: 'kick',           // Acoustic Bass Drum
  36: 'kick',           // Bass Drum 1
  
  // Snare
  38: 'snare',          // Acoustic Snare
  40: 'snare',          // Electric Snare
  37: 'snare',          // Side Stick (optional, often mapped to snare)

  // Hi-Hats
  42: 'hihat_closed',   // Closed Hi-Hat
  44: 'hihat_closed',   // Pedal Hi-Hat
  46: 'hihat_open',     // Open Hi-Hat
  
  // Cymbals
  49: 'crash',          // Crash Cymbal 1
  57: 'crash',          // Crash Cymbal 2
  51: 'ride',           // Ride Cymbal 1
  59: 'ride',           // Ride Cymbal 2
  
  // Toms (Optional - mapping these to existing types or ignoring them for now)
  // You can add more DrumTypes to your types.ts if you want to support toms later.
};

export const KEYBOARD_MAP: Record<string, number> = {
  'a': 36, // Kick (Bass Drum 1)
  's': 38, // Snare (Acoustic Snare)
  'd': 42, // Hi-Hat Closed
  'f': 46, // Hi-Hat Open
  ' ': 49, // Crash (Spacebar maps to Crash 1)
  'j': 51, // Ride (Ride Cymbal 1)
  // You can map 'z' or 'x' to Toms if you add them later
};