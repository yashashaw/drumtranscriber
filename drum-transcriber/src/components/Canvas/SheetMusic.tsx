import React, { useEffect, useRef } from 'react';
import { Renderer, Stave, Voice, Formatter } from 'vexflow';
import { useScoreStore } from '../../store/scoreStore';
import { convertToVexNotes } from '../../utils/VexMap'; // Ensure casing matches your file (VexMap vs vexMap)

export const SheetMusic: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const notes = useScoreStore((state) => state.notes);

  useEffect(() => {
    if (!containerRef.current) return;

    // 1. Wipe Canvas
    containerRef.current.innerHTML = '';
    
    // 2. Calculate Width (Start at 800px, add 60px per note)
    const width = Math.max(800, notes.length * 60 + 100); 
    
    // 3. Initialize Renderer
    const renderer = new Renderer(containerRef.current, Renderer.Backends.SVG);
    renderer.resize(width, 200);
    const context = renderer.getContext();

    // 4. Draw the Staff
    const stave = new Stave(10, 40, width - 20);
    stave.addClef("percussion").addTimeSignature("4/4");
    stave.setContext(context).draw();

    // 5. Draw Notes (if any)
    if (notes.length > 0) {
      const vexNotes = convertToVexNotes(notes);

      const voice = new Voice({ numBeats: 4, beatValue: 4 });
      voice.setMode(Voice.Mode.SOFT); // Infinite scroll mode
      voice.addTickables(vexNotes);

      // Format notes to prevent overlapping
      new Formatter().joinVoices([voice]).format([voice], width - 50);
      
      voice.draw(context, stave);
    }
    
    // 6. Auto-scroll to end
    containerRef.current.scrollLeft = containerRef.current.scrollWidth;

  }, [notes]);

  return (
    <div 
      ref={containerRef} 
      className="p-4 bg-white border rounded shadow-md overflow-x-auto"
      style={{ minHeight: '220px' }}
    />
  );
};