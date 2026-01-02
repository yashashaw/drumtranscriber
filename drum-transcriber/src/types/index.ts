export type NoteDuration = '1' | '2' | '4' | '8' | '16';
export type DrumType = 'kick' | 'snare' | 'hihat_closed' | 'hihat_open' | 'crash' | 'ride';

export interface RenderedNote {
  id: string;
  types: DrumType[]; // array to handle chords
  duration: NoteDuration;
  isRest: boolean;
}