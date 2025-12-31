import { useEffect, useRef } from 'react';
import { useScoreStore } from '../store/scoreStore';
import { classifyDuration } from '../utils/quantizer';
import { MIDI_TO_DRUM } from '../utils/drumMap';
import type { DrumType } from '../types';
import { useInput } from './useInput';

interface PendingHit {
  type: DrumType;
  time: number;
}

export function useTranscriber(bpm: number = 120) {
  const { lastNote } = useInput();
  const addNote = useScoreStore((state) => state.addNote);
  
  // State from your file
  const pendingBuffer = useRef<PendingHit[]>([]); // Array to hold chords
  const flushTimeout = useRef<number | null>(null);

  useEffect(() => {
    if (lastNote === null) return;

    const drumType = MIDI_TO_DRUM[lastNote];
    if (!drumType) return;

    const now = performance.now();

    // 1. Clear the "End of Phrase" timeout
    if (flushTimeout.current) clearTimeout(flushTimeout.current);

    // 2. Sliding Window Logic
    if (pendingBuffer.current.length > 0) {
      // Calculate delta from the FIRST note in the pending group
      const delta = now - pendingBuffer.current[0].time;
      const duration = classifyDuration(delta, bpm);

      if (duration === 'chord') {
        // It's a chord! Add to the pile and don't draw anything yet.
        pendingBuffer.current.push({ type: drumType, time: now });
      } else {
        // It's a new rhythmic step! 
        // Commit the OLD pile as a finished note/chord
        addNote({
          id: crypto.randomUUID(),
          types: pendingBuffer.current.map(h => h.type), // Extract all drums
          duration: duration,
          isRest: false
        });

        // Start a NEW pile with the current hit
        pendingBuffer.current = [{ type: drumType, time: now }];
      }
    } else {
      // First hit ever (or after a flush)
      pendingBuffer.current = [{ type: drumType, time: now }];
    }

    // 3. Set Safety Flush (End of Phrase)
    flushTimeout.current = window.setTimeout(() => {
      if (pendingBuffer.current.length > 0) {
        addNote({
          id: crypto.randomUUID(),
          types: pendingBuffer.current.map(h => h.type),
          duration: 'w', // Default to whole note if you stop playing
          isRest: false
        });
        pendingBuffer.current = [];
      }
    }, 2000);

  }, [lastNote, bpm, addNote]);
}