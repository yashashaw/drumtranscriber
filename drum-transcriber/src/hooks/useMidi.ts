// A "Mock" hook that pretends no MIDI is connected
export const useMidi = () => {
  return { lastNote: null };
};