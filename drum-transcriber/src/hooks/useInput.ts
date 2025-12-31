import { useMidi } from './useMidi';
import { useKeyboard } from './useKeyboard';

export function useInput() {
  const { lastNote: midiNote } = useMidi();
  const { keyboardNote } = useKeyboard();

  // "Priority OR" - If MIDI fires, use it. If Keyboard fires, use it.
  // Since both hooks auto-reset to null after 10ms, they won't conflict 
  // unless you hit both at the exact same millisecond.
  const lastNote = midiNote ?? keyboardNote;

  return { lastNote };
}