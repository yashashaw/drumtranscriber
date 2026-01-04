import { useEffect, useRef } from 'react';
import { useScoreStore } from '../store/scoreStore';

interface WindowWithWebkitAudio extends Window {
  webkitAudioContext: typeof AudioContext;
}

export function useMetronome() {
  const bpm = useScoreStore((state) => state.bpm);
  const isPlaying = useScoreStore((state) => state.isMetronomeOn);

  // We use a ref for the audio context so it persists across renders
  const audioContext = useRef<AudioContext | null>(null);
  
  // We need to keep track of the next note time between renders
  const nextNoteTime = useRef<number>(0.0);
  
  // We use a ref for the timer ID to clear it properly
  const timerID = useRef<number | null>(null);

  useEffect(() => {
    // If not playing, ensure we clean up any running timers
    if (!isPlaying) {
      if (timerID.current !== null) {
        window.clearTimeout(timerID.current);
      }
      return;
    }

    // --- Audio Logic ---
    const lookahead = 25.0; // ms
    const scheduleAheadTime = 0.1; // sec

    // 1. Initialize AudioContext (if null or closed)
    if (!audioContext.current) {
      const AudioContextClass = window.AudioContext || 
        (window as unknown as WindowWithWebkitAudio).webkitAudioContext;
      audioContext.current = new AudioContextClass();
    }

    if (audioContext.current.state === 'suspended') {
      audioContext.current.resume();
    }

    // Reset "next note" to right now to avoid a delay when starting
    // Only reset if we are just starting up (e.g. nextNoteTime is way in the past)
    if (nextNoteTime.current < audioContext.current.currentTime) {
      nextNoteTime.current = audioContext.current.currentTime + 0.05;
    }

    // 2. Define the sound generator
    const playClick = (time: number) => {
      if (!audioContext.current) return;

      const osc = audioContext.current.createOscillator();
      const envelope = audioContext.current.createGain();

      osc.frequency.value = 1000;
      envelope.gain.value = 1;

      // Click envelope
      envelope.gain.exponentialRampToValueAtTime(0.001, time + 0.05);

      osc.connect(envelope);
      envelope.connect(audioContext.current.destination);

      osc.start(time);
      osc.stop(time + 0.05);
    };

    // 3. Define the Scheduler
    const scheduler = () => {
      if (!audioContext.current) return;

      // Schedule notes that fall within the lookahead window
      while (nextNoteTime.current < audioContext.current.currentTime + scheduleAheadTime) {
        playClick(nextNoteTime.current);
        
        // Calculate seconds per beat
        const secondsPerBeat = 60.0 / bpm;
        nextNoteTime.current += secondsPerBeat;
      }

      timerID.current = window.setTimeout(scheduler, lookahead);
    };

    // 4. Start the loop
    scheduler();

    // Cleanup function: runs when isPlaying becomes false OR bpm changes
    return () => {
      if (timerID.current !== null) {
        window.clearTimeout(timerID.current);
      }
    };
  }, [isPlaying, bpm]); 
}