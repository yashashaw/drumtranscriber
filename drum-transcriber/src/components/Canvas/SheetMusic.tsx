import React, { useEffect, useRef } from 'react';
import { Renderer, Stave, Voice, Formatter } from 'vexflow';
import { useScoreStore } from '../../store/scoreStore';
import { convertToVexNotes } from '../../utils/VexMap';
import type { RenderedNote } from '../../types';

// --- CONFIGURATION ---
const STAVE_WIDTH = 300; // Width of one measure
const SYSTEM_HEIGHT = 140; // Height of one line (including spacing)
const PADDING = 10;
const BEATS_PER_MEASURE = 4;

export const SheetMusic: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const notes = useScoreStore((state) => state.notes);

  // Helper: Calculate beat value of a duration string ('q' -> 1, '8' -> 0.5)
  const getDurationValue = (duration: string): number => {
    switch (duration.replace(/\W/g, '')) { // Remove dots/modifiers for lookup
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
    if (!containerRef.current) return;

    // 1. Clear Previous Render
    containerRef.current.innerHTML = '';
    
    // 2. Measure Container Width (to know when to wrap)
    const containerWidth = containerRef.current.clientWidth || 800;
    
    // 3. Initialize Renderer
    // We start with height 0 and resize it at the end based on how many lines we drew
    const renderer = new Renderer(containerRef.current, Renderer.Backends.SVG);
    const context = renderer.getContext();

    // 4. Group Notes into Measures
    // We need to slice the flat list of notes into chunks that fit in 4 beats
    const measures: RenderedNote[][] = [];
    let currentMeasure: RenderedNote[] = [];
    let currentBeats = 0;

    notes.forEach((note) => {
      const val = getDurationValue(note.duration);
      
      // If adding this note exceeds the measure, push current and start new
      if (currentBeats + val > BEATS_PER_MEASURE) {
        measures.push(currentMeasure);
        currentMeasure = [];
        currentBeats = 0;
      }
      
      currentMeasure.push(note);
      currentBeats += val;
    });
    
    // Push the final (incomplete) measure if it exists
    if (currentMeasure.length > 0) {
      measures.push(currentMeasure);
    }

    // 5. Render Loop
    let x = PADDING;
    let y = 20; // Top margin

    measures.forEach((measureNotes, index) => {
      // A. Check for Wrap (Typewriter Logic)
      if (x + STAVE_WIDTH > containerWidth) {
        x = PADDING;       // Reset carriage to left
        y += SYSTEM_HEIGHT; // Move down one line
      }

      // B. Create Stave
      const stave = new Stave(x, y, STAVE_WIDTH);
      
      // Add Clef/TimeSig ONLY if it's the first measure OR start of a new line
      if (index === 0 || x === PADDING) {
        stave.addClef("percussion");
        if (index === 0) stave.addTimeSignature("4/4");
      }
      
      stave.setContext(context).draw();

      // C. Draw Notes
      if (measureNotes.length > 0) {
        const vexNotes = convertToVexNotes(measureNotes);
        
        // Create a Voice that fits these notes
        // Note: For incomplete measures, VexFlow might complain if strict mode is on.
        // We set strict: false to allow playing half a measure without crashing.
        const voice = new Voice({ numBeats: BEATS_PER_MEASURE, beatValue: 4 });
        voice.setStrict(false); 
        voice.addTickables(vexNotes);

        // Format and join
        new Formatter().joinVoices([voice]).format([voice], STAVE_WIDTH - 50);
        
        voice.draw(context, stave);
      }

      // D. Advance X
      x += STAVE_WIDTH;
    });

    // 6. Resize Canvas Height to fit the final music
    renderer.resize(containerWidth, y + SYSTEM_HEIGHT);

    // 7. Auto-scroll to BOTTOM (instead of right) so you see the latest line
    containerRef.current.scrollTop = containerRef.current.scrollHeight;

  }, [notes]);

  return (
    <div 
      ref={containerRef} 
      className="p-4 bg-white border rounded shadow-md overflow-y-auto" // changed to overflow-y
      style={{ 
        height: '400px', // Fixed height for the window
        width: '100%' 
      }}
    />
  );
};