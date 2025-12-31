export type DrumType = 'kick' | 'snare' | 'hihat_closed' | 'hihat_open' | 'crash' | 'ride';

export interface RenderedNote {
  id: string;        // Unique ID (UUID)
  type: DrumType;    // Instrument name
  duration: string;  // VexFlow duration: 'w', 'h', 'q', '8', '16'
  isRest: boolean;
}