import React from 'react';
import { useScoreStore } from '../../store/scoreStore';

export const BpmControl: React.FC = () => {
  // Connect to the store to read and write the BPM
  const bpm = useScoreStore((state) => state.bpm);
  const setBpm = useScoreStore((state) => state.setBpm);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBpm(Number(e.target.value));
  };

  return (
    <div className="flex items-center gap-3 px-3 py-1 border border-gray-200 rounded bg-white h-full">
      <label 
        htmlFor="bpm-slider" 
        className="text-sm font-medium text-gray-700 whitespace-nowrap min-w-[80px]"
      >
        Tempo: {bpm}
      </label>
      
      <input
        id="bpm-slider"
        type="range"
        min="40"
        max="220"
        step="1"
        value={bpm}
        onChange={handleChange}
        className="cursor-pointer"
        title="Adjust BPM"
      />
    </div>
  );
};