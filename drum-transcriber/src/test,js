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
// This holds the "Note 0" or "Note 1" waiting to be processed
let pendingNote = null; 
let flushTimeout = null;

// --- HELPER: The Quantizer ---
// Takes milliseconds, returns a string name (Quarter, Eighth, etc.)
function classifyDuration(deltaMs) {
    const beats = deltaMs / MS_PER_BEAT;
    
    // Simple rounding logic to nearest musical neighbor
    if (beats >= 3.5) return "Whole Note (1/1)";
    if (beats >= 1.5) return "Half Note (1/2)";
    if (beats >= 0.75) return "Quarter Note (1/4)";
    if (beats >= 0.35) return "Eighth Note (1/8)";
    if (beats >= 0.18) return "Sixteenth Note (1/16)";
    return "Thirty-Second Note (1/32)"; // For very fast rolls
}

// --- MAIN LOGIC ---
document.addEventListener('keydown', (e) => {
    // 1. Identify Input
    const drumType = keyMap[e.key.toLowerCase()];
    if (!drumType) return; // Ignore keys that aren't drums

    const now = performance.now();
    
    // LOG: Immediate feedback that a hit occurred
    console.log(`🥁 HIT DETECTED: [${drumType}] at ${Math.round(now)}ms`);

    // 2. Clear the "Flush" timeout (User is still playing)
    if (flushTimeout) clearTimeout(flushTimeout);

    // 3. The "Sliding Window" Logic
    if (pendingNote) {
        // We have a previous note in the buffer! 
        // Calculate distance between NOW and THEN.
        const delta = now - pendingNote.time;

        // Classify the PREVIOUS note based on this gap
        const durationName = classifyDuration(delta);

        // LOG: The "Commit" - Note 1 is officially processed
        console.log(`%c✅ COMMITTED: The previous ${pendingNote.type} was a ${durationName} (${Math.round(delta)}ms)`, "color: #00ff00; font-weight: bold;");
    } else {
        console.log(`ℹ️ First hit of the session. Waiting for next hit to calculate duration...`);
    }

    // 4. Shift the Buffer
    // The current hit becomes the pending note for the next cycle
    pendingNote = {
        type: drumType,
        time: now
    };

    // 5. The "Flush" Safety Valve
    // If you stop playing for 2 seconds, we assume the song is over 
    // and commit the final note as a Whole Note.
    flushTimeout = setTimeout(() => {
        if (pendingNote) {
            console.log(`%c🛑 END OF PHRASE: Flushing final ${pendingNote.type} as Whole Note (timed out)`, "color: orange");
            pendingNote = null;
        }
    }, 2000);
});

console.log("System Ready. Type 'a' for Kick, 's' for Snare. Focus the page first!");