import React from 'react';
// CHANGE 1: Import the unified hook instead of the raw MIDI hook
import { useInput } from '../../hooks/useInput'; 

export const MidiStatus: React.FC = () => {
  // CHANGE 2: Use the unified hook
  const { lastNote } = useInput(); 

  return (
    <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 rounded-full border border-gray-200 shadow-sm">
      {/* LED Light - No logic changes needed here */}
      <div 
        className={`w-3 h-3 rounded-full transition-all duration-300 ${
          lastNote ? 'bg-green-500 shadow-[0_0_10px_#22c55e]' : 'bg-red-400'
        }`} 
      />
      
      {/* Text Label - Optional cosmetic update */}
      <span className="text-sm font-semibold text-gray-600 font-mono">
        {/* Changed "MIDI Signal" to "Input" to be accurate for keyboard too */}
        {lastNote ? `Input Signal: ${lastNote}` : "Waiting for Input..."}
      </span>
    </div>
  );
};