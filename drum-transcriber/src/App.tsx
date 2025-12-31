import { SheetMusic } from './components/Canvas/SheetMusic';
import { MidiStatus } from './components/Controls/MidiStatus';
import { useTranscriber } from './hooks/useTranscriber';
import './App.css'

function App() {
  // Initialize the "Brain" (currently sleeping in the skeleton version)
  useTranscriber();

  return (
    <div className="container">
      <header className="header">
        <h1>Drum Transcriber</h1>
        <MidiStatus />
      </header>

      <main className="main-content">
        <SheetMusic />
        
        <div className="instructions">
          <p>Graphics Test Mode</p>
          <small>Plug in a MIDI device (if logic was active) or just admire the empty staff!</small>
        </div>
      </main>
    </div>
  );
}

export default App;