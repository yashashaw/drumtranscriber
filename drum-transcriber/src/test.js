// test.js

// 1. Use 'import' instead of 'require'
import readline from 'readline';
import { performance } from 'perf_hooks'; // Node.js specific import for high-precision time

// --- CONFIGURATION ---
const BPM = 120;
const MS_PER_BEAT = 60000 / BPM; 

const keyMap = {
    'a': 'Kick',
    's': 'Snare',
    'd': 'Hi-Hat Closed',
    'f': 'Crash'
};

// --- STATE ---
let pendingNote = null; 
let flushTimeout = null;

// --- HELPER ---
function classifyDuration(deltaMs) {
    const beats = deltaMs / MS_PER_BEAT;
    
    if (beats >= 3.5) return "Whole Note (1/1)";
    if (beats >= 1.5) return "Half Note (1/2)";
    if (beats >= 0.75) return "Quarter Note (1/4)";
    if (beats >= 0.35) return "Eighth Note (1/8)";
    if (beats >= 0.18) return "Sixteenth Note (1/16)";
    return "Thirty-Second Note (1/32)";
}

// --- KEYBOARD SETUP ---
readline.emitKeypressEvents(process.stdin);
if (process.stdin.isTTY) {
    process.stdin.setRawMode(true);
}

console.log("-----------------------------------------------------");
console.log("🥁 DRUM TRANSCRIBER (ES MODULE MODE)");
console.log("Press 'a' (Kick) or 's' (Snare). Press 'q' to quit.");
console.log("-----------------------------------------------------");

process.stdin.on('keypress', (str, key) => {
    // Exit handler
    if (key.name === 'q' || (key.ctrl && key.name === 'c')) {
        process.exit();
    }

    const drumType = keyMap[key.name];
    if (!drumType) return; 

    // --- LOGIC ---
    const now = performance.now();
    
    // Immediate Feedback
    console.log(`\n🥁 HIT: [${drumType}] at ${Math.round(now)}ms`);

    // Clear Timeout
    if (flushTimeout) clearTimeout(flushTimeout);

    // Sliding Window Calculation
    if (pendingNote) {
        const delta = now - pendingNote.time;
        const durationName = classifyDuration(delta);

        // Green Text for Success
        console.log(`\x1b[32m✅ COMMITTED: Previous ${pendingNote.type} was a ${durationName} (${Math.round(delta)}ms)\x1b[0m`);
    } else {
        console.log(`ℹ️ First hit. Waiting for next hit...`);
    }

    // Shift Buffer
    pendingNote = { type: drumType, time: now };

    // Set Safety Flush
    flushTimeout = setTimeout(() => {
        if (pendingNote) {
            console.log(`\x1b[33m🛑 END OF PHRASE: Flushing final ${pendingNote.type} as Whole Note\x1b[0m`);
            pendingNote = null;
        }
    }, 2000);
});