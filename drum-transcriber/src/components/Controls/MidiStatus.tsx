import React from 'react';
import { useMidi } from '../../hooks/useMidi';

export const MidiStatus: React.FC = () => {
  const { lastNote } = useMidi();

  return (
    <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 rounded-full border border-gray-200 shadow-sm">
      {/* LED Light */}
      <div 
        className={`w-3 h-3 rounded-full transition-all duration-300 ${
          lastNote ? 'bg-green-500 shadow-[0_0_10px_#22c55e]' : 'bg-red-400'
        }`} 
      />
      
      {/* Text Label */}
      <span className="text-sm font-semibold text-gray-600 font-mono">
        {lastNote ? `MIDI Signal: ${lastNote}` : "Waiting for Input..."}
      </span>
    </div>
  );
};