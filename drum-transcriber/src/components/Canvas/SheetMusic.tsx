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

export const SheetMusic: React.FC = () => {
  // REF 1: The Wrapper (Handles scrollbar)
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  // REF 2: The VexFlow Target (Where music is drawn)
  const rendererRef = useRef<HTMLDivElement>(null);
  
  // REF 3: The Anchor (An invisible element at the very bottom)
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

    // FIX 1: Lock the height to prevent collapse (and the jump to top)
    const currentHeight = rendererRef.current.clientHeight;
    rendererRef.current.style.height = `${currentHeight}px`;

    // 1. Clear the drawing area
    rendererRef.current.innerHTML = '';
    
    // 2. Safe width calculation
    const containerWidth = Math.max(800, scrollContainerRef.current.clientWidth - 40);

    const renderer = new Renderer(rendererRef.current, Renderer.Backends.SVG);
    const context = renderer.getContext();

    // 3. Group Notes
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

    // 4. Draw Loop
    let x = PADDING;
    let y = 20;

    measures.forEach((measureNotes, index) => {
      if (x + STAVE_WIDTH > containerWidth) {
        x = PADDING;
        y += SYSTEM_HEIGHT;
      }

      const stave = new Stave(x, y, STAVE_WIDTH);
      if (index === 0 || x === PADDING) {
        stave.addClef("percussion");
        if (index === 0) stave.addTimeSignature("4/4");
      }
      stave.setContext(context).draw();

      if (measureNotes.length > 0) {
        const vexNotes = convertToVexNotes(measureNotes);
        const voice = new Voice({ numBeats: BEATS_PER_MEASURE, beatValue: 4 });
        voice.setStrict(false);
        voice.addTickables(vexNotes);
        new Formatter().joinVoices([voice]).format([voice], STAVE_WIDTH - 50);
        voice.draw(context, stave);
      }
      x += STAVE_WIDTH;
    });

    // 5. Calculate Final Height
    const finalHeight = y + SYSTEM_HEIGHT;

    // FIX 2: Set the specific height style on the DIV
    rendererRef.current.style.height = `${finalHeight}px`;
    
    // FIX 3: Update VexFlow size
    renderer.resize(containerWidth, finalHeight);

    // 6. Scroll to anchor
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
      {/* The Music */}
      <div ref={rendererRef} />

      {/* TEXT (Moves down as music grows) */}
      <div className="text-center py-8 text-gray-500">
          <small>
            Play your electronic drums. The system will detect notes, 
            calculate duration, and transcribe chords automatically.
          </small>
      </div>
      
      {/* The Invisible Anchor - Always sits at the bottom */}
      <div ref={bottomAnchorRef} style={{ height: 1 }} />
    </div>
  );
};