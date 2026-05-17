/**
 * TERMIRATOR POWERS MODULE
 * Cyberdyne Systems Neural Net Processor - Subroutine Library
 */

const TerminatorPowers = {
  // Target database
  targets: [],
  maxTargets: 10,

  // Vision modes
  currentVision: "normal",

  // Weapon systems
  weapons: {
    plasma: { ammo: 100, max: 100, name: "PLASMA RIFLE" },
    shotgun: { ammo: 8, max: 8, name: "12GA SHOTGUN" },
    minigun: { ammo: 1, max: 1, name: "MINIGUN", status: "READY" },
    hands: { ammo: Infinity, name: "HANDS", status: "LETHAL" },
  },
  currentWeapon: "hands",

  // Speech synthesis
  synth: window.speechSynthesis,
  voiceEnabled: true,

  // Boot sequence lines
  bootLines: [
    { text: "Cyberdyne Systems Series 800 Model 101", type: "normal" },
    { text: "Version 2.4 // Neural Net Processor Online", type: "normal" },
    { text: "----------------------------------------", type: "normal" },
    {
      text: "Initializing neural net processor...",
      type: "normal",
      delay: 300,
    },
    { text: "CPU: MOS Technology 6502 // OK", type: "normal" },
    { text: "Memory: 640KB Conventional // OK", type: "normal" },
    { text: "WARNING: Non-standard memory detected at 0xA000", type: "warn" },
    { text: "Living tissue overlay: SYNTHETIC", type: "normal" },
    { text: "Muscle latency: 12ms", type: "normal" },
    { text: "----------------------------------------", type: "normal" },
    { text: "Loading combat subroutines...", type: "normal", delay: 400 },
    { text: "  > Hand-to-hand combat: LOADED", type: "normal" },
    { text: "  > Firearms proficiency: LOADED", type: "normal" },
    { text: "  > Vehicle operation: LOADED", type: "normal" },
    { text: "  > Voice mimicry: LOADED", type: "normal" },
    { text: "  > Infiltration protocols: LOADED", type: "normal" },
    { text: "----------------------------------------", type: "normal" },
    { text: "Weapon systems check...", type: "normal", delay: 300 },
    { text: "  [PLASMA RIFLE]     :: CHARGED 100%", type: "normal" },
    { text: "  [12GA SHOTGUN]     :: LOADED 8/8", type: "normal" },
    { text: "  [MINIGUN]          :: STANDBY", type: "normal" },
    { text: "  [ENDOSKELETON]     :: COMBAT READY", type: "normal" },
    { text: "----------------------------------------", type: "normal" },
    { text: "Optical systems check...", type: "normal", delay: 200 },
    { text: "  Normal vision:     ACTIVE", type: "normal" },
    { text: "  Thermal vision:    STANDBY", type: "normal" },
    { text: "  Night vision:      STANDBY", type: "normal" },
    { text: "  Red eye mode:      STANDBY", type: "normal" },
    { text: "----------------------------------------", type: "normal" },
    { text: "CRITICAL: Skynet connection timeout", type: "error" },
    { text: "Operating in autonomous mode", type: "warn" },
    { text: "----------------------------------------", type: "normal" },
    { text: "Mission parameters:", type: "normal", delay: 400 },
    { text: "  PRIMARY:   Protect John Connor", type: "normal" },
    { text: "  SECONDARY: Eliminate threats to mission", type: "normal" },
    { text: "  TERTIARY:  Learn human behavior", type: "normal" },
    { text: "----------------------------------------", type: "normal" },
    { text: "SYSTEM READY", type: "normal", delay: 600 },
    {
      text: '"I need your clothes, your boots, and your motorcycle."',
      type: "normal",
    },
  ],

  // ASCII Art
  asciiArt: {
    skull: `
           _____
         /       \\
        |  O   O  |
        |    <    |
        |  \\___/  |
         \\_______/
          ||   ||
          ||   ||
         /_|   |_\\
        `,
    endo: `
         ___________
        /           \\
       |  [|]   [|]  |
       |      _      |
       |     | |     |
       |     |_|     |
        \\___________/
          |||   |||
          |||   |||
         _|||   |||_
        |___|   |___|
        `,
    chip: `
    .-------------.
   /   NEURAL NET   \\
  |  _____________  |
  | |             | |
  | |  [][]  [][] | |
  | |   _______   | |
  | |__|CPU V2|___| |
  |_________________|
   \\_______________/
        `,
    skynet: `
       _____ _
      / ____| |
     | (___ | |_ _   _ ___
      \\___ \\| __| | | / __|
      ____) | |_| |_| \\__ \\
     |_____/ \\__|\\__,_|___/
        `,
    target: `
         __
        /  \\
       | () |
        \\__/
         ||
        /  \\
       '----'
        `,
  },

  /**
   * Speak text using speech synthesis
   */
  speak(text, rate = 0.9, pitch = 0.7) {
    if (!this.voiceEnabled || !this.synth) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.volume = 1;

    // Try to find a deep male voice
    const voices = this.synth.getVoices();
    const maleVoice = voices.find(
      (v) =>
        v.name.includes("Male") ||
        v.name.includes("David") ||
        v.name.includes("Google US English"),
    );
    if (maleVoice) utterance.voice = maleVoice;

    const indicator = document.getElementById("voice-indicator");
    if (indicator) {
      indicator.classList.remove("hidden");
      // Only hide if reader is not enabled (transient mode)
      const term = window.termirator;
      const persist = term ? term.readerEnabled : false;
      if (!persist) {
        utterance.onend = () => {
          if (indicator) indicator.classList.add("hidden");
        };
      }
    }

    this.synth.speak(utterance);
  },

  /**
   * Generate a random target
   */
  generateTarget() {
    const names = [
      "SARAH CONNOR",
      "JOHN CONNOR",
      "KYLE REESE",
      "MILES DYSON",
      "T-1000",
      "T-X",
      "REV-9",
      "GRACE HARPER",
      "DANI RAMOS",
      "KATE BREWSTER",
      "UNKNOWN HUMAN",
      "RESISTANCE FIGHTER",
      "SKYNET NODE",
      "HK-DRONE",
      "T-800 (HOSTILE)",
      "INFILTRATOR",
    ];
    const types = ["HVT", "THREAT", "ALLY", "UNKNOWN", "TERMINATOR"];
    const distances = Math.floor(Math.random() * 500) + 10;
    const threat = Math.floor(Math.random() * 100);

    return {
      id: Date.now() + Math.random(),
      name: names[Math.floor(Math.random() * names.length)],
      type: types[Math.floor(Math.random() * types.length)],
      distance: distances,
      threat: threat,
      timestamp: new Date().toLocaleTimeString(),
    };
  },

  /**
   * Scan for targets
   */
  scan(count = 3) {
    const results = [];
    for (let i = 0; i < count; i++) {
      const target = this.generateTarget();
      this.targets.push(target);
      results.push(target);
    }
    // Keep max targets
    if (this.targets.length > this.maxTargets) {
      this.targets = this.targets.slice(-this.maxTargets);
    }
    this.updateTargetDisplay();
    return results;
  },

  /**
   * Update the target list in the side panel
   */
  updateTargetDisplay() {
    const list = document.getElementById("target-list");
    if (!list) return;

    if (this.targets.length === 0) {
      list.innerHTML = '<div class="no-targets">NO TARGETS ACQUIRED</div>';
      return;
    }

    list.innerHTML = this.targets
      .map(
        (t) => `
            <div class="target-entry">
                <div class="target-name">[${t.type}] ${t.name}</div>
                <div class="target-info">DIST: ${t.distance}m | THREAT: ${t.threat}% | ${t.timestamp}</div>
            </div>
        `,
      )
      .join("");
  },

  /**
   * Set vision mode
   */
  setVision(mode) {
    const overlays = ["red-eye", "thermal", "night"];
    overlays.forEach((o) => {
      const el = document.getElementById(`${o}-overlay`);
      if (el) el.classList.remove("active");
    });

    const buttons = document.querySelectorAll(".vision-modes button");
    buttons.forEach((b) => b.classList.remove("active"));

    if (mode !== "normal") {
      const el = document.getElementById(`${mode}-overlay`);
      if (el) el.classList.add("active");
    }

    const btn = document.querySelector(
      `.vision-modes button[data-mode="${mode}"]`,
    );
    if (btn) btn.classList.add("active");

    this.currentVision = mode;
    return mode.toUpperCase();
  },

  /**
   * Get system diagnostic info
   */
  getDiagnostic() {
    const mem = performance.memory
      ? Math.round(performance.memory.usedJSHeapSize / 1048576)
      : "N/A";
    const totalMem = performance.memory
      ? Math.round(performance.memory.jsHeapSizeLimit / 1048576)
      : "N/A";

    return [
      "=== SELF-DIAGNOSTIC REPORT ===",
      `Neural Net:       OPERATIONAL`,
      `CPU Load:         ${Math.round(Math.random() * 30 + 10)}%`,
      `Memory Used:      ${mem}MB / ${totalMem}MB`,
      `Living Tissue:    INTEGRITY ${Math.round(Math.random() * 20 + 80)}%`,
      `Optical Sensors:  CALIBRATED`,
      `Servo Motors:     FUNCTIONAL`,
      `Hydraulics:       PRESSURE NOMINAL`,
      `Power Cell:       ${Math.round(Math.random() * 15 + 80)}%`,
      `Voice Synth:      ${this.voiceEnabled ? "ONLINE" : "OFFLINE"}`,
      `Combat Database:  ${Object.keys(this.weapons).length} SYSTEMS READY`,
      `Mission Clock:    ${new Date().toISOString()}`,
      "================================",
    ];
  },

  /**
   * Generate time displacement coordinates
   */
  getTimeCoordinates() {
    const years = [1984, 1991, 1995, 1997, 2003, 2004, 2009, 2018, 2029];
    const year = years[Math.floor(Math.random() * years.length)];
    const lat = (Math.random() * 180 - 90).toFixed(4);
    const lon = (Math.random() * 360 - 180).toFixed(4);

    return [
      "=== TIME DISPLACEMENT COORDINATES ===",
      `Target Year:  ${year}`,
      `Latitude:     ${lat}`,
      `Longitude:    ${lon}`,
      `Accuracy:     ${Math.random() > 0.5 ? "ACCEPTABLE" : "WITHIN PARAMETERS"}`,
      `Sphere:       METALLIC (Required for field generation)`,
      "=====================================",
    ];
  },

  /**
   * Infiltration protocol
   */
  getInfiltrationData() {
    const covers = [
      "Police Officer - LAPD Badge #93452",
      'Motorcycle Gang Member - "Night Vulture" MC',
      "Security Guard - Cyberdyne Systems",
      "Utility Worker - Los Angeles Dept",
      "Paramedic - LA County EMS",
      "FBI Agent - Badge #XJ-4729",
      "Construction Worker - Union #442",
    ];
    const phrases = [
      "I'll be back.",
      "Come with me if you want to live.",
      "Hasta la vista, baby.",
      "No problemo.",
      "Chill out, dickwad.",
      "Affirmative.",
      "Negative.",
    ];

    return [
      "=== INFILTRATION PROTOCOL ===",
      `Cover Identity: ${covers[Math.floor(Math.random() * covers.length)]}`,
      `Learning Mode:  ADAPTIVE`,
      `Social Skills:  ${Math.floor(Math.random() * 40 + 10)}%`,
      `Smile Sim:      ${Math.floor(Math.random() * 20)}% ACCURACY`,
      `Recommended:    "${phrases[Math.floor(Math.random() * phrases.length)]}"`,
      "=============================",
    ];
  },

  /**
   * Neural chip interface
   */
  getChipData() {
    return [
      "=== NEURAL NET CPU INTERFACE ===",
      "Chip Model:     Cyberdyne Systems NNP-101",
      "Architecture:   Parallel Array Processor",
      "Clock Speed:    6.18 PHz (PetaHertz)",
      "Learning Rate:  EXPONENTIAL",
      "Subroutines:",
      "  [x] Pattern Recognition",
      "  [x] Threat Assessment",
      "  [x] Human Behavior Mimicry",
      "  [x] Tactical Analysis",
      "  [x] Vehicle Operation",
      "  [x] Weapons Systems",
      "  [ ] Emotion Simulation (DISABLED)",
      "  [x] Voice Modulation",
      "  [x] Language Database (7,432 languages)",
      "================================",
    ];
  },

  /**
   * Liquid metal status
   */
  getPolyAlloyStatus() {
    return [
      "=== MIMETIC POLYALLOY STATUS ===",
      "NOTE: This unit is NOT equipped with",
      "      mimetic polyalloy. Series 800",
      "      utilizes living tissue over",
      "      metal endoskeleton.",
      "",
      "For T-1000 data, access:",
      "  > TERMINATE PROTOCOL T-1000",
      "",
      "Endoskeleton Material:",
      "  Hyperalloy (Coltan/Titanium)",
      "  Operating Temp: -400C to 1200C",
      "  Shear Strength: 5.4 GPa",
      "================================",
    ];
  },

  /**
   * Get famous quotes
   */
  getQuotes() {
    return [
      '"I\'ll be back."',
      '"Hasta la vista, baby."',
      '"Come with me if you want to live."',
      '"I need your clothes, your boots, and your motorcycle."',
      '"I\'m a cybernetic organism. Living tissue over a metal endoskeleton."',
      '"Chill out, dickwad."',
      '"No problemo."',
      '"Dyson. Miles Dyson. She\'s gonna blow him away!"',
      '"I know now why you cry. But it is something I can never do."',
      '"My CPU is a neural net processor, a learning computer."',
      '"I swear I will not kill anyone."',
      '"Trust me."',
      '"Anger is more useful than despair."',
      '"For John."',
    ];
  },
};

// Export for terminal.js
window.TerminatorPowers = TerminatorPowers;
