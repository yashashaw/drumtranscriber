import { useEffect, useState } from 'react';
import { KEYBOARD_MAP } from '../utils/drumMap';

export function useKeyboard() {
  const [keyboardNote, setKeyboardNote] = useState<number | null>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // 1. Prevent trigger spam if key is held down
      if (event.repeat) return;

      // 2. Ignore typing in inputs/textareas
      const target = event.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

      // 3. Look up the MIDI number
      const key = event.key.toLowerCase();
      const note = KEYBOARD_MAP[key];

      // 4. If mapped, trigger the "Pulse"
      if (note) {
        setKeyboardNote(note);
        
        // Clear it shortly after to allow re-triggering the same note
        setTimeout(() => setKeyboardNote(null), 10);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return { keyboardNote };
}