import { SheetMusic } from './components/Canvas/SheetMusic';
import { MidiStatus } from './components/Controls/MidiStatus';
import { useTranscriber } from './hooks/useTranscriber';
import { useScoreStore } from './store/scoreStore'; // Import the store to get the clear function
import './App.css';
import { exportToPDF } from './utils/exportPDF';

function App() {
  // 1. Activate the Logic Engine
  useTranscriber();

  // 2. Get the clear function
  const clearScore = useScoreStore((state) => state.clearScore);

  return (
    <div className="container">
      <header className="header">
        <h1>Drum Transcriber</h1>
        <div className="controls">
          <MidiStatus />
          {/* A new button to wipe the sheet clean */}
          <button 
            onClick={clearScore}
            className="px-3 py-1 text-sm text-red-600 border border-red-200 rounded hover:bg-red-50"
          >
            Clear Sheet
          </button>
          <button
            onClick={() => exportToPDF()}
            className="export-btn"
          >
            Export PDF
          </button>
        </div>
      </header>

      <main className="main-content">
        <SheetMusic />
        
      </main>
    </div>
  );
}

export default App;