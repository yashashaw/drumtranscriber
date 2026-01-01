import React, { useEffect, useRef } from 'react';
import { Renderer, Stave, Voice, Formatter } from 'vexflow';
import { useScoreStore } from '../../store/scoreStore';
import { convertToVexNotes } from '../../utils/VexMap';
import type { RenderedNote } from '../../types';

// --- CONFIGURATION ---
const STAVE_WIDTH = 250; 
const SYSTEM_HEIGHT = 150; 
const PADDING = 10;
const BEATS_PER_MEASURE = 4;
const MEASURE_BATCH_SIZE = 4; // New config for the "chunks" of 4

export const SheetMusic: React.FC = () => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<HTMLDivElement>(null);
  const bottomAnchorRef = useRef<HTMLDivElement>(null);
  const notes = useScoreStore((state) => state.notes);

  const getDurationValue = (duration: string): number => {
    switch (duration.replace(/\W/g, '')) {
      case 'w': return 4;
      case 'h': return 2;
      case 'q': return 1;
      case '8': return 0.5;
      case '16': return 0.25;
      case '32': return 0.125;
      default: return 0;
    }
  };

  useEffect(() => {
    if (!rendererRef.current || !scrollContainerRef.current) return;

    // FIX 1: Lock height to prevent jumpiness
    const currentHeight = rendererRef.current.clientHeight;
    rendererRef.current.style.height = `${currentHeight}px`;

    // 1. Clear Canvas
    rendererRef.current.innerHTML = '';
    
    // 2. Calculate Width
    const containerWidth = Math.max(800, scrollContainerRef.current.clientWidth - 40);
    const renderer = new Renderer(rendererRef.current, Renderer.Backends.SVG);
    const context = renderer.getContext();

    // 3. Group Notes into Measures (Existing Logic)
    const measures: RenderedNote[][] = [];
    let currentMeasure: RenderedNote[] = [];
    let currentBeats = 0;

    notes.forEach((note) => {
      const val = getDurationValue(note.duration);
      if (currentBeats + val > BEATS_PER_MEASURE) {
        measures.push(currentMeasure);
        currentMeasure = [];
        currentBeats = 0;
      }
      currentMeasure.push(note);
      currentBeats += val;
    });
    if (currentMeasure.length > 0) measures.push(currentMeasure);

    // --- NEW LOGIC START ---
    
    // 4. Determine Total Staves (Multiples of 4)
    // If we have 0 measures, we want 4. If we have 5, we want 8.
    const filledCount = measures.length;
    // Math.max(1, ...) ensures we start with at least 1 chunk if empty
    const totalStaves = Math.ceil(Math.max(filledCount, 1) / MEASURE_BATCH_SIZE) * MEASURE_BATCH_SIZE;

    // 5. Draw Loop (Iterate through ALL staves, empty or full)
    let x = PADDING;
    let y = 20;

    for (let i = 0; i < totalStaves; i++) {
      // A. Handle Wrapping
      if (x + STAVE_WIDTH > containerWidth) {
        x = PADDING;
        y += SYSTEM_HEIGHT;
      }

      // B. Draw the Stave (Empty Box)
      const stave = new Stave(x, y, STAVE_WIDTH);
      
      // Add Clef/TimeSig to the very first stave, OR the first stave of a new line
      if (i === 0 || x === PADDING) {
        stave.addClef("percussion");
        if (i === 0) stave.addTimeSignature("4/4");
      }
      stave.setContext(context).draw();

      // C. Draw Notes (If this measure exists in our data)
      const measureNotes = measures[i]; // May be undefined if we are in the "empty" zone
      
      if (measureNotes && measureNotes.length > 0) {
        const vexNotes = convertToVexNotes(measureNotes);
        const voice = new Voice({ numBeats: BEATS_PER_MEASURE, beatValue: 4 });
        
        // Strict: false allows us to render incomplete measures without crashing
        voice.setStrict(false);
        voice.addTickables(vexNotes);
        
        new Formatter().joinVoices([voice]).format([voice], STAVE_WIDTH - 50);
        voice.draw(context, stave);
      }

      // D. Advance Cursor
      x += STAVE_WIDTH;
    }
    // --- NEW LOGIC END ---

    // 6. Final Resize
    const finalHeight = y + SYSTEM_HEIGHT;
    rendererRef.current.style.height = `${finalHeight}px`;
    renderer.resize(containerWidth, finalHeight);

    // 7. Scroll
    bottomAnchorRef.current?.scrollIntoView({ 
      behavior: "smooth", 
      block: "nearest" 
    });

  }, [notes]);

  return (
    <div 
      ref={scrollContainerRef} 
      className="p-4 bg-white border rounded shadow-md overflow-y-auto relative"
      style={{ height: '400px', width: '100%' }}
    >
      <div ref={rendererRef} />

      <div className="text-center py-8 text-gray-500">
        <small>
          Play your electronic drums. The system will detect notes, 
          calculate duration, and transcribe chords automatically.
        </small>
      </div>
      
      <div ref={bottomAnchorRef} style={{ height: 1 }} />
    </div>
  );
};