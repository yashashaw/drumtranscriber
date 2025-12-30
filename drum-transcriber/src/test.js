// --- CONFIGURATION ---
const BPM = 120;
const MS_PER_BEAT = 60000 / BPM; // 500ms per quarter note at 120 BPM

// The Drum Map
const keyMap = {
    'a': 'Kick',
    's': 'Snare',
    'd': 'Hi-Hat Closed',
    'f': 'Crash'
};

// --- STATE (The Buffer) ---
let pendingNote = null; 
let flushTimeout = null;

// --- HELPER: The Quantizer ---
function classifyDuration(deltaMs) {
    const beats = deltaMs / MS_PER_BEAT;
    
    if (beats >= 3.5) return "Whole Note (1/1)";
    if (beats >= 1.5) return "Half Note (1/2)";
    if (beats >= 0.75) return "Quarter Note (1/4)";
    if (beats >= 0.35) return "Eighth Note (1/8)";
    if (beats >= 0.18) return "Sixteenth Note (1/16)";
    return "Thirty-Second Note (1/32)";
}

// --- NODE.JS KEYBOARD LISTENER ---
// This enables "Raw Mode" so we can catch individual key presses without hitting Enter
const readline = require('readline');
readline.emitKeypressEvents(process.stdin);
if (process.stdin.isTTY) {
    process.stdin.setRawMode(true);
}

console.log("-----------------------------------------------------");
console.log("🥁 DRUM TRANSCRIBER LOGIC TEST (NODE.JS)");
console.log("Press 'a' (Kick) or 's' (Snare). Press 'q' to quit.");
console.log("-----------------------------------------------------");

process.stdin.on('keypress', (str, key) => {
    // Allow user to quit
    if (key.name === 'q' || (key.ctrl && key.name === 'c')) {
        process.exit();
    }

    const drumType = keyMap[key.name];
    if (!drumType) return; // Ignore other keys

    // --- EXACT SAME LOGIC AS BEFORE STARTS HERE ---
    
    const now = performance.now();
    
    // LOG: Immediate hit
    console.log(`\n🥁 HIT: [${drumType}] at ${Math.round(now)}ms`);

    // 2. Clear Flush
    if (flushTimeout) clearTimeout(flushTimeout);

    // 3. Sliding Window Logic
    if (pendingNote) {
        const delta = now - pendingNote.time;
        const durationName = classifyDuration(delta);

        // We use ANSI codes (\x1b...) for color in terminal, since %c doesn't work in Node
        console.log(`\x1b[32m✅ COMMITTED: The previous ${pendingNote.type} was a ${durationName} (${Math.round(delta)}ms)\x1b[0m`);
    } else {
        console.log(`ℹ️ First hit. Waiting for next hit to calculate duration...`);
    }

    // 4. Shift Buffer
    pendingNote = {
        type: drumType,
        time: now
    };

    // 5. Flush Safety Valve
    flushTimeout = setTimeout(() => {
        if (pendingNote) {
            console.log(`\x1b[33m🛑 END OF PHRASE: Flushing final ${pendingNote.type} as Whole Note\x1b[0m`);
            pendingNote = null;
        }
    }, 2000);
});