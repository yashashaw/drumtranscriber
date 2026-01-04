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
const MEASURE_BATCH_SIZE = 4;

export const SheetMusic: React.FC = () => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<HTMLDivElement>(null);
  const bottomAnchorRef = useRef<HTMLDivElement>(null);

  // 1. Grab notes AND the load action from the store
  const { notes, loadNotesFromBackend } = useScoreStore();

  const getDurationValue = (duration: string): number => {
    switch (duration.replace(/\W/g, '')) {
      case '1': return 4;
      case '2': return 2;
      case '4': return 1;
      case '8': return 0.5;
      case '16': return 0.25;
      case '32': return 0.125;
      default: return 0;
    }
  };

  // 2. NEW: Trigger reload on mount
  useEffect(() => {
    loadNotesFromBackend();
  }, [loadNotesFromBackend]);

  // 3. Existing VexFlow Logic
  useEffect(() => {
    if (!rendererRef.current || !scrollContainerRef.current) return;

    // FIX 1: Lock height to prevent jumpiness
    const currentHeight = rendererRef.current.clientHeight;
    rendererRef.current.style.height = `${currentHeight}px`;

    // Clear Canvas
    rendererRef.current.innerHTML = '';

    // Calculate Width
    const containerWidth = Math.max(800, scrollContainerRef.current.clientWidth - 40);
    const renderer = new Renderer(rendererRef.current, Renderer.Backends.SVG);
    const context = renderer.getContext();

    // Group Notes into Measures
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

    // Determine Total Staves
    const filledCount = measures.length;
    const totalStaves = Math.ceil(Math.max(filledCount, 1) / MEASURE_BATCH_SIZE) * MEASURE_BATCH_SIZE;

    // Draw Loop
    let x = PADDING;
    let y = 20;

    for (let i = 0; i < totalStaves; i++) {
      if (x + STAVE_WIDTH > containerWidth) {
        x = PADDING;
        y += SYSTEM_HEIGHT;
      }

      const stave = new Stave(x, y, STAVE_WIDTH);

      if (i === 0 || x === PADDING) {
        stave.addClef("percussion");
        if (i === 0) stave.addTimeSignature("4/4");
      }
      stave.setContext(context).draw();

      const measureNotes = measures[i];

      if (measureNotes && measureNotes.length > 0) {
        const vexNotes = convertToVexNotes(measureNotes);
        const voice = new Voice({ numBeats: BEATS_PER_MEASURE, beatValue: 4 });

        voice.setStrict(false);
        voice.addTickables(vexNotes);

        new Formatter().joinVoices([voice]).format([voice], STAVE_WIDTH - 50);
        voice.draw(context, stave);
      }

      x += STAVE_WIDTH;
    }

    // Final Resize
    const finalHeight = y + SYSTEM_HEIGHT;
    rendererRef.current.style.height = `${finalHeight}px`;
    renderer.resize(containerWidth, finalHeight);

    // Scroll
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