/**
 * ═══════════════════════════════════════════════════════════════════════════
 * C1: TECH RUNNER — RETRO-TECHNICAL 2D PLATFORMER
 * 10 Progressive Sectors · Physics Engine · Original Field Engineer Character
 * Web Audio Synthesizer (Default: OFF) · Desktop & Mobile Touch Gamepad
 * ═══════════════════════════════════════════════════════════════════════════
 */

(function () {
  'use strict';

  // ─────────────────────────────────────────────────────────────────────────
  // CONSTANTS & STORAGE KEYS
  // ─────────────────────────────────────────────────────────────────────────
  const STORAGE_KEY = 'cyper_tech_runner_v1';
  const V_WIDTH = 960;
  const V_HEIGHT = 540;

  // ─────────────────────────────────────────────────────────────────────────
  // SYNTHESIZED WEB AUDIO API (STARTS OFF BY DEFAULT)
  // ─────────────────────────────────────────────────────────────────────────
  let audioCtx = null;
  let sfxEnabled = false;

  function initAudio() {
    if (!audioCtx && (window.AudioContext || window.webkitAudioContext)) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      audioCtx = new Ctx();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  function playTone(freq, type, duration, gainVal, pitchDrop, delay) {
    if (!sfxEnabled) return;
    try {
      initAudio();
      if (!audioCtx) return;

      const startTime = audioCtx.currentTime + (delay || 0);
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = type || 'sine';
      osc.frequency.setValueAtTime(freq, startTime);
      if (pitchDrop) {
        osc.frequency.exponentialRampToValueAtTime(Math.max(20, freq - pitchDrop), startTime + duration);
      }

      gain.gain.setValueAtTime(gainVal || 0.12, startTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start(startTime);
      osc.stop(startTime + duration);
    } catch (_) {}
  }

  const Sound = {
    jump: () => playTone(240, 'square', 0.1, 0.1, -220),
    doubleJump: () => {
      playTone(420, 'triangle', 0.08, 0.12, -260);
      playTone(660, 'square', 0.12, 0.1, -180, 0.05);
    },
    stomp: () => {
      playTone(280, 'square', 0.14, 0.18, 200);
      playTone(110, 'sawtooth', 0.18, 0.22, 60, 0.03);
    },
    bit: () => playTone(1280, 'sine', 0.06, 0.09),
    byte: () => {
      playTone(880, 'sine', 0.06, 0.1);
      playTone(1320, 'triangle', 0.09, 0.1, 0, 0.04);
    },
    packet: () => {
      playTone(680, 'triangle', 0.06, 0.12);
      playTone(1040, 'sine', 0.08, 0.12, 0, 0.05);
      playTone(1480, 'triangle', 0.12, 0.12, 0, 0.1);
    },
    token: () => {
      [523, 659, 784, 1046].forEach((f, i) => {
        playTone(f, 'triangle', 0.14, 0.14, 0, i * 0.06);
      });
    },
    switchFlip: () => {
      playTone(1200, 'square', 0.03, 0.12);
      playTone(580, 'triangle', 0.12, 0.14, 0, 0.03);
    },
    terminal: () => {
      [740, 880, 1100, 1400].forEach((f, i) => {
        playTone(f, 'square', 0.05, 0.08, 0, i * 0.04);
      });
    },
    checkpoint: () => {
      [587, 740, 880].forEach((f, i) => {
        playTone(f, 'triangle', 0.15, 0.12, 0, i * 0.08);
      });
    },
    fan: () => playTone(120, 'triangle', 0.25, 0.08, -60),
    hit: () => {
      playTone(240, 'sawtooth', 0.22, 0.2, 160);
      playTone(90, 'square', 0.3, 0.22, 50, 0.05);
    },
    levelWin: () => {
      const melody = [523, 659, 784, 988, 1046, 1318];
      melody.forEach((f, i) => {
        playTone(f, 'triangle', 0.18, 0.16, 0, i * 0.09);
      });
    },
    grandWin: () => {
      const melody = [523, 659, 784, 1046, 784, 1046, 1318, 1568];
      melody.forEach((f, i) => {
        playTone(f, 'triangle', 0.24, 0.18, 0, i * 0.1);
      });
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // 10 SECTOR ARCHITECTURE / LEVEL DEFINITIONS
  // ─────────────────────────────────────────────────────────────────────────
  const LEVELS_DATA = [
    {
      id: 1,
      name: 'Boot Sequence',
      subtitle: 'INITIALIZING FIRMWARE // BASICS & DIAGNOSTICS',
      difficulty: 'TUTORIAL / NORMAL',
      width: 2600,
      hazards: 'STATIC BUGS, GAPS',
      objective: 'Master movement, stomp BUG-01, harvest bits, and reach the System Core.',
      spawn: { x: 80, y: 380 },
      checkpoint: { x: 1250, y: 380 },
      platforms: [
        { x: 0, y: 460, w: 460, h: 80, style: 'rack' },
        { x: 540, y: 460, w: 500, h: 80, style: 'rack' },
        { x: 300, y: 360, w: 140, h: 22, style: 'bus' },
        { x: 490, y: 300, w: 140, h: 22, style: 'bus' },
        { x: 700, y: 340, w: 160, h: 22, style: 'bus' },
        { x: 920, y: 270, w: 180, h: 22, style: 'bus' },
        { x: 1150, y: 460, w: 600, h: 80, style: 'rack' },
        { x: 1380, y: 350, w: 150, h: 22, style: 'bus' },
        { x: 1580, y: 280, w: 150, h: 22, style: 'bus' },
        { x: 1820, y: 460, w: 780, h: 80, style: 'rack' },
        { x: 1950, y: 360, w: 160, h: 22, style: 'bus' },
        { x: 2160, y: 290, w: 160, h: 22, style: 'bus' }
      ],
      collectibles: [
        { x: 220, y: 410, type: 'bit' },
        { x: 250, y: 410, type: 'bit' },
        { x: 340, y: 310, type: 'bit' },
        { x: 530, y: 250, type: 'byte' },
        { x: 750, y: 290, type: 'bit' },
        { x: 780, y: 290, type: 'bit' },
        { x: 1000, y: 220, type: 'token', index: 0 },
        { x: 1220, y: 410, type: 'bit' },
        { x: 1430, y: 300, type: 'bit' },
        { x: 1630, y: 230, type: 'token', index: 1 },
        { x: 2000, y: 310, type: 'byte' },
        { x: 2210, y: 240, type: 'token', index: 2 },
        { x: 2340, y: 410, type: 'bit' }
      ],
      enemies: [
        { type: 'bug', x: 650, y: 436, minX: 560, maxX: 980, speed: 1.2 },
        { type: 'bug', x: 1400, y: 436, minX: 1180, maxX: 1700, speed: 1.4 },
        { type: 'bug', x: 2050, y: 436, minX: 1840, maxX: 2400, speed: 1.5 }
      ],
      terminals: [
        { x: 380, y: 400, id: 'term-boot', label: 'SYS_DIAG', text: 'SYSTEM DIAGNOSTIC: ALL MEMORY CHANNELS PASS.' }
      ],
      goal: { x: 2460, y: 380 }
    },

    {
      id: 2,
      name: 'LAN Access',
      subtitle: 'ROUTER ARRAYS // MOVING BUS PLATFORMS',
      difficulty: 'NORMAL',
      width: 2900,
      hazards: 'HIGH GAPS, PACKET DROPS, MOVING BRIDGES',
      objective: 'Flip the network router switch to align data bridges.',
      spawn: { x: 80, y: 380 },
      checkpoint: { x: 1400, y: 380 },
      platforms: [
        { x: 0, y: 460, w: 420, h: 80, style: 'rack' },
        { x: 480, y: 380, w: 130, h: 22, style: 'moving', dx: 140, speed: 1.2, axis: 'x' },
        { x: 740, y: 460, w: 400, h: 80, style: 'rack' },
        { x: 1180, y: 380, w: 140, h: 22, style: 'bus' },
        { x: 1340, y: 460, w: 460, h: 80, style: 'rack' },
        { x: 1850, y: 420, w: 120, h: 22, style: 'moving', dx: 120, speed: 1.5, axis: 'y' },
        { x: 2040, y: 340, w: 140, h: 22, style: 'bus' },
        { x: 2240, y: 460, w: 660, h: 80, style: 'rack' },
        // Bridge controlled by switch 1
        { x: 1490, y: 320, w: 160, h: 22, style: 'switchable', switchId: 1, active: false }
      ],
      switches: [
        { x: 850, y: 420, id: 1, active: false, label: 'BUS_RELAY_01' }
      ],
      collectibles: [
        { x: 200, y: 410, type: 'bit' },
        { x: 530, y: 330, type: 'byte' },
        { x: 790, y: 410, type: 'bit' },
        { x: 920, y: 410, type: 'token', index: 0 },
        { x: 1220, y: 330, type: 'bit' },
        { x: 1420, y: 410, type: 'packet' },
        { x: 1540, y: 270, type: 'token', index: 1 },
        { x: 1900, y: 320, type: 'byte' },
        { x: 2100, y: 280, type: 'token', index: 2 },
        { x: 2450, y: 410, type: 'bit' },
        { x: 2490, y: 410, type: 'bit' }
      ],
      enemies: [
        { type: 'bug', x: 860, y: 436, minX: 750, maxX: 1100, speed: 1.3 },
        { type: 'packet', x: 1550, y: 436, minX: 1360, maxX: 1760, speed: 2.2 },
        { type: 'bug', x: 2400, y: 436, minX: 2260, maxX: 2700, speed: 1.5 }
      ],
      terminals: [
        { x: 1040, y: 400, id: 'term-lan', label: 'GATEWAY', text: 'DEFAULT GATEWAY 192.168.1.1 ONLINE // MTU 1500 OK.' }
      ],
      goal: { x: 2750, y: 380 }
    },

    {
      id: 3,
      name: 'Packet Storm',
      subtitle: 'HIGH CONGESTION // TIMED BUFFER TRANSIT',
      difficulty: 'NORMAL+',
      width: 3100,
      hazards: 'RAPID PACKET DROPS, NARROW STEPPING STONES',
      objective: 'Navigate high traffic buffers and harvest stray UDP packets.',
      spawn: { x: 80, y: 380 },
      checkpoint: { x: 1500, y: 380 },
      platforms: [
        { x: 0, y: 460, w: 380, h: 80, style: 'rack' },
        { x: 440, y: 400, w: 120, h: 22, style: 'bus' },
        { x: 620, y: 340, w: 120, h: 22, style: 'bus' },
        { x: 800, y: 460, w: 360, h: 80, style: 'rack' },
        { x: 1220, y: 390, w: 110, h: 22, style: 'moving', dx: 110, speed: 1.6, axis: 'x' },
        { x: 1420, y: 460, w: 450, h: 80, style: 'rack' },
        { x: 1940, y: 380, w: 120, h: 22, style: 'bus' },
        { x: 2120, y: 310, w: 120, h: 22, style: 'bus' },
        { x: 2300, y: 250, w: 130, h: 22, style: 'bus' },
        { x: 2500, y: 460, w: 600, h: 80, style: 'rack' }
      ],
      collectibles: [
        { x: 220, y: 410, type: 'packet' },
        { x: 480, y: 350, type: 'bit' },
        { x: 660, y: 290, type: 'token', index: 0 },
        { x: 880, y: 410, type: 'packet' },
        { x: 920, y: 410, type: 'bit' },
        { x: 1260, y: 340, type: 'byte' },
        { x: 1520, y: 410, type: 'packet' },
        { x: 1720, y: 410, type: 'token', index: 1 },
        { x: 2160, y: 260, type: 'byte' },
        { x: 2350, y: 200, type: 'token', index: 2 },
        { x: 2700, y: 410, type: 'packet' }
      ],
      enemies: [
        { type: 'packet', x: 260, y: 436, minX: 120, maxX: 360, speed: 2.4 },
        { type: 'packet', x: 950, y: 436, minX: 820, maxX: 1120, speed: 2.6 },
        { type: 'packet', x: 1650, y: 436, minX: 1440, maxX: 1820, speed: 2.8 },
        { type: 'bug', x: 2720, y: 436, minX: 2520, maxX: 2980, speed: 1.5 }
      ],
      terminals: [
        { x: 880, y: 400, id: 'term-storm', label: 'QOS_FILTER', text: 'BUFFER CONGESTION 78% // PACKET DROP RATE REDUCED.' }
      ],
      goal: { x: 2950, y: 380 }
    },

    {
      id: 4,
      name: 'Debug Sector',
      subtitle: 'VOLATILE CODE BLOCKS // HIDDEN BRIDGES',
      difficulty: 'HARD',
      width: 3200,
      hazards: 'DISAPPEARING SYNTAX BLOCKS, MEM LEAK BLOBS',
      objective: 'Time your jumps on flashing code platforms and patch memory leaks.',
      spawn: { x: 80, y: 380 },
      checkpoint: { x: 1600, y: 380 },
      platforms: [
        { x: 0, y: 460, w: 360, h: 80, style: 'rack' },
        { x: 420, y: 400, w: 100, h: 22, style: 'blinking', cycle: 150, phase: 0 },
        { x: 570, y: 330, w: 100, h: 22, style: 'blinking', cycle: 150, phase: 75 },
        { x: 730, y: 460, w: 380, h: 80, style: 'rack' },
        { x: 1170, y: 410, w: 110, h: 22, style: 'bus' },
        { x: 1330, y: 340, w: 110, h: 22, style: 'blinking', cycle: 160, phase: 0 },
        { x: 1500, y: 460, w: 440, h: 80, style: 'rack' },
        { x: 2000, y: 390, w: 110, h: 22, style: 'blinking', cycle: 140, phase: 0 },
        { x: 2160, y: 320, w: 110, h: 22, style: 'blinking', cycle: 140, phase: 70 },
        { x: 2330, y: 260, w: 120, h: 22, style: 'bus' },
        { x: 2520, y: 460, w: 680, h: 80, style: 'rack' }
      ],
      collectibles: [
        { x: 200, y: 410, type: 'fragment' },
        { x: 460, y: 340, type: 'bit' },
        { x: 610, y: 270, type: 'token', index: 0 },
        { x: 850, y: 410, type: 'byte' },
        { x: 1210, y: 350, type: 'bit' },
        { x: 1370, y: 280, type: 'token', index: 1 },
        { x: 1680, y: 410, type: 'fragment' },
        { x: 2200, y: 260, type: 'byte' },
        { x: 2380, y: 200, type: 'token', index: 2 },
        { x: 2750, y: 410, type: 'bit' }
      ],
      enemies: [
        { type: 'memleak', x: 920, y: 380, range: 240, speed: 0.8 },
        { type: 'bug', x: 800, y: 436, minX: 740, maxX: 1080, speed: 1.4 },
        { type: 'memleak', x: 1720, y: 380, range: 260, speed: 0.9 },
        { type: 'bug', x: 2700, y: 436, minX: 2540, maxX: 3050, speed: 1.6 }
      ],
      terminals: [
        { x: 880, y: 400, id: 'term-debug', label: 'GDB_ATTACH', text: 'BREAKPOINT HIT: NULL POINTER RESOLVED AT 0x004F.' }
      ],
      goal: { x: 3050, y: 380 }
    },

    {
      id: 5,
      name: 'Memory Leak',
      subtitle: 'CORRUPTED STACK // DECAYING RAM CLUSTERS',
      difficulty: 'HARD',
      width: 3400,
      hazards: 'CRUMBLING RAM PLATFORMS, HOMING MEM LEAKS',
      objective: 'Cross fragile memory blocks before the garbage collector collapses them.',
      spawn: { x: 80, y: 380 },
      checkpoint: { x: 1700, y: 380 },
      platforms: [
        { x: 0, y: 460, w: 340, h: 80, style: 'rack' },
        { x: 400, y: 410, w: 100, h: 22, style: 'crumble' },
        { x: 550, y: 360, w: 100, h: 22, style: 'crumble' },
        { x: 700, y: 310, w: 100, h: 22, style: 'crumble' },
        { x: 860, y: 460, w: 360, h: 80, style: 'rack' },
        { x: 1280, y: 400, w: 110, h: 22, style: 'bus' },
        { x: 1450, y: 350, w: 100, h: 22, style: 'crumble' },
        { x: 1600, y: 460, w: 440, h: 80, style: 'rack' },
        { x: 2100, y: 410, w: 90, h: 22, style: 'crumble' },
        { x: 2240, y: 360, w: 90, h: 22, style: 'crumble' },
        { x: 2380, y: 310, w: 90, h: 22, style: 'crumble' },
        { x: 2520, y: 260, w: 120, h: 22, style: 'bus' },
        { x: 2700, y: 460, w: 700, h: 80, style: 'rack' }
      ],
      collectibles: [
        { x: 200, y: 410, type: 'byte' },
        { x: 440, y: 350, type: 'bit' },
        { x: 590, y: 300, type: 'bit' },
        { x: 740, y: 250, type: 'token', index: 0 },
        { x: 960, y: 410, type: 'fragment' },
        { x: 1320, y: 340, type: 'byte' },
        { x: 1490, y: 290, type: 'token', index: 1 },
        { x: 1750, y: 410, type: 'packet' },
        { x: 2420, y: 250, type: 'byte' },
        { x: 2570, y: 200, type: 'token', index: 2 },
        { x: 2900, y: 410, type: 'fragment' }
      ],
      enemies: [
        { type: 'memleak', x: 600, y: 260, range: 260, speed: 0.9 },
        { type: 'bug', x: 980, y: 436, minX: 880, maxX: 1180, speed: 1.5 },
        { type: 'memleak', x: 1800, y: 380, range: 280, speed: 1.0 },
        { type: 'packet', x: 2880, y: 436, minX: 2720, maxX: 3200, speed: 2.5 }
      ],
      terminals: [
        { x: 1040, y: 400, id: 'term-ram', label: 'MEM_POOL', text: 'HEAP DUMP SAVED // UNMAPPED 128MB LEAKING POINTERS.' }
      ],
      goal: { x: 3250, y: 380 }
    },

    {
      id: 6,
      name: 'Hardware Lab',
      subtitle: 'THERMAL UPFLOW // ROTATING FANS & HEATSINKS',
      difficulty: 'CHALLENGING',
      width: 3400,
      hazards: 'HIGH CHASSIS GAPS, PATROL DRONES',
      objective: 'Ride cooling fan drafts to reach upper heatsink rails.',
      spawn: { x: 80, y: 380 },
      checkpoint: { x: 1700, y: 380 },
      platforms: [
        { x: 0, y: 460, w: 320, h: 80, style: 'rack' },
        { x: 340, y: 470, w: 90, h: 70, style: 'fan', liftForce: 0.92 },
        { x: 460, y: 240, w: 160, h: 22, style: 'bus' },
        { x: 680, y: 310, w: 140, h: 22, style: 'bus' },
        { x: 880, y: 460, w: 380, h: 80, style: 'rack' },
        { x: 1300, y: 470, w: 90, h: 70, style: 'fan', liftForce: 0.94 },
        { x: 1420, y: 210, w: 160, h: 22, style: 'bus' },
        { x: 1640, y: 460, w: 460, h: 80, style: 'rack' },
        { x: 2150, y: 470, w: 90, h: 70, style: 'fan', liftForce: 0.96 },
        { x: 2280, y: 190, w: 180, h: 22, style: 'bus' },
        { x: 2520, y: 320, w: 140, h: 22, style: 'bus' },
        { x: 2720, y: 460, w: 680, h: 80, style: 'rack' }
      ],
      collectibles: [
        { x: 180, y: 410, type: 'byte' },
        { x: 380, y: 280, type: 'bit' },
        { x: 530, y: 180, type: 'token', index: 0 },
        { x: 740, y: 250, type: 'packet' },
        { x: 1000, y: 410, type: 'bit' },
        { x: 1340, y: 270, type: 'bit' },
        { x: 1490, y: 150, type: 'token', index: 1 },
        { x: 1780, y: 410, type: 'fragment' },
        { x: 2360, y: 130, type: 'token', index: 2 },
        { x: 2580, y: 260, type: 'byte' },
        { x: 2900, y: 410, type: 'packet' }
      ],
      enemies: [
        { type: 'drone', x: 620, y: 280, minX: 520, maxX: 780, speed: 1.4 },
        { type: 'bug', x: 1020, y: 436, minX: 900, maxX: 1220, speed: 1.5 },
        { type: 'drone', x: 1800, y: 320, minX: 1680, maxX: 2020, speed: 1.6 },
        { type: 'bug', x: 2920, y: 436, minX: 2740, maxX: 3250, speed: 1.6 }
      ],
      terminals: [
        { x: 1060, y: 400, id: 'term-hw', label: 'PWM_RPM', text: 'THERMAL SENSOR: 42°C NOMINAL // FAN CONTROLLER SET TO 2200 RPM.' }
      ],
      goal: { x: 3250, y: 380 }
    },

    {
      id: 7,
      name: 'Firewall Gateway',
      subtitle: 'SECURITY PERIMETER // SWITCHABLE LASER BEAMS',
      difficulty: 'VERY HARD',
      width: 3600,
      hazards: 'HIGH-VOLTAGE LASER BARRIERS, PATROL DRONES',
      objective: 'Locate security circuit breakers to disarm laser grids.',
      spawn: { x: 80, y: 380 },
      checkpoint: { x: 1800, y: 380 },
      platforms: [
        { x: 0, y: 460, w: 360, h: 80, style: 'rack' },
        { x: 420, y: 390, w: 130, h: 22, style: 'bus' },
        { x: 620, y: 330, w: 130, h: 22, style: 'bus' },
        { x: 820, y: 460, w: 420, h: 80, style: 'rack' },
        // Laser 1
        { x: 1040, y: 240, w: 16, h: 220, style: 'laser', laserId: 1, active: true },
        { x: 1300, y: 410, w: 120, h: 22, style: 'bus' },
        { x: 1480, y: 340, w: 120, h: 22, style: 'bus' },
        { x: 1660, y: 460, w: 460, h: 80, style: 'rack' },
        // Laser 2
        { x: 1980, y: 240, w: 16, h: 220, style: 'laser', laserId: 2, active: true },
        { x: 2200, y: 380, w: 120, h: 22, style: 'moving', dx: 130, speed: 1.5, axis: 'x' },
        { x: 2420, y: 300, w: 140, h: 22, style: 'bus' },
        { x: 2620, y: 460, w: 980, h: 80, style: 'rack' }
      ],
      switches: [
        { x: 670, y: 290, id: 1, active: false, label: 'FW_GATE_ALPHA' },
        { x: 1530, y: 300, id: 2, active: false, label: 'FW_GATE_BETA' }
      ],
      collectibles: [
        { x: 220, y: 410, type: 'packet' },
        { x: 470, y: 330, type: 'bit' },
        { x: 670, y: 240, type: 'token', index: 0 },
        { x: 920, y: 410, type: 'fragment' },
        { x: 1350, y: 350, type: 'byte' },
        { x: 1720, y: 410, type: 'token', index: 1 },
        { x: 2260, y: 320, type: 'packet' },
        { x: 2470, y: 240, type: 'token', index: 2 },
        { x: 2850, y: 410, type: 'bit' },
        { x: 3100, y: 410, type: 'fragment' }
      ],
      enemies: [
        { type: 'drone', x: 500, y: 300, minX: 420, maxX: 650, speed: 1.3 },
        { type: 'bug', x: 960, y: 436, minX: 840, maxX: 1020, speed: 1.4 },
        { type: 'drone', x: 1820, y: 320, minX: 1700, maxX: 1960, speed: 1.5 },
        { type: 'packet', x: 2900, y: 436, minX: 2700, maxX: 3300, speed: 2.6 }
      ],
      terminals: [
        { x: 1140, y: 400, id: 'term-fw', label: 'IPTABLES', text: 'RULES UPDATED: ACCEPT PORT 8080 // INGRESS TRAFFIC PURGED.' }
      ],
      goal: { x: 3450, y: 380 }
    },

    {
      id: 8,
      name: 'Kernel Panic',
      subtitle: 'LOW GRAVITY CRASH // NULL PROCESS RESISTANCE',
      difficulty: 'VERY HARD+',
      width: 3600,
      gravity: 0.28, // Special low-gravity sector!
      hazards: 'NULL PROCESS PHANTOMS, HIGH VOID CHASM',
      objective: 'Utilize low-gravity propulsion to clear deep memory voids.',
      spawn: { x: 80, y: 380 },
      checkpoint: { x: 1800, y: 380 },
      platforms: [
        { x: 0, y: 460, w: 320, h: 80, style: 'rack' },
        { x: 420, y: 370, w: 100, h: 22, style: 'bus' },
        { x: 640, y: 280, w: 100, h: 22, style: 'bus' },
        { x: 880, y: 460, w: 340, h: 80, style: 'rack' },
        { x: 1300, y: 360, w: 100, h: 22, style: 'moving', dx: 140, speed: 1.4, axis: 'x' },
        { x: 1540, y: 260, w: 100, h: 22, style: 'bus' },
        { x: 1740, y: 460, w: 420, h: 80, style: 'rack' },
        { x: 2260, y: 340, w: 90, h: 22, style: 'crumble' },
        { x: 2440, y: 240, w: 90, h: 22, style: 'crumble' },
        { x: 2640, y: 380, w: 120, h: 22, style: 'bus' },
        { x: 2840, y: 460, w: 760, h: 80, style: 'rack' }
      ],
      collectibles: [
        { x: 200, y: 410, type: 'fragment' },
        { x: 460, y: 310, type: 'bit' },
        { x: 680, y: 220, type: 'token', index: 0 },
        { x: 960, y: 410, type: 'byte' },
        { x: 1340, y: 290, type: 'packet' },
        { x: 1580, y: 200, type: 'token', index: 1 },
        { x: 1860, y: 410, type: 'fragment' },
        { x: 2300, y: 280, type: 'byte' },
        { x: 2480, y: 180, type: 'token', index: 2 },
        { x: 3100, y: 410, type: 'packet' }
      ],
      enemies: [
        { type: 'null', x: 620, y: 240, minX: 550, maxX: 750, speed: 1.2 },
        { type: 'null', x: 1000, y: 436, minX: 900, maxX: 1180, speed: 1.3 },
        { type: 'null', x: 1900, y: 436, minX: 1760, maxX: 2100, speed: 1.4 },
        { type: 'null', x: 3000, y: 436, minX: 2860, maxX: 3400, speed: 1.5 }
      ],
      terminals: [
        { x: 1040, y: 400, id: 'term-kp', label: 'CRASH_DUMP', text: 'KERNEL PANIC TRACE: RESTORING CRITICAL REGISTER STATE.' }
      ],
      goal: { x: 3450, y: 380 }
    },

    {
      id: 9,
      name: 'System Recovery',
      subtitle: 'DISTRIBUTED NODES // MULTI-TERMINAL OVERRIDE',
      difficulty: 'EXPERT',
      width: 3800,
      hazards: 'HIGH LASERS, CRUMBLING RAM, CONVERGED ANOMALIES',
      objective: 'Activate all 3 distributed terminals to open the exit bulkhead.',
      spawn: { x: 80, y: 380 },
      checkpoint: { x: 1900, y: 380 },
      requiredTerminals: 3,
      platforms: [
        { x: 0, y: 460, w: 340, h: 80, style: 'rack' },
        { x: 400, y: 380, w: 120, h: 22, style: 'bus' },
        { x: 580, y: 280, w: 150, h: 22, style: 'bus' }, // Node A platform
        { x: 800, y: 460, w: 380, h: 80, style: 'rack' },
        { x: 1240, y: 400, w: 100, h: 22, style: 'blinking', cycle: 150, phase: 0 },
        { x: 1400, y: 320, w: 100, h: 22, style: 'blinking', cycle: 150, phase: 75 },
        { x: 1560, y: 220, w: 150, h: 22, style: 'bus' }, // Node B platform
        { x: 1780, y: 460, w: 460, h: 80, style: 'rack' },
        { x: 2320, y: 400, w: 90, h: 22, style: 'crumble' },
        { x: 2480, y: 320, w: 90, h: 22, style: 'crumble' },
        { x: 2640, y: 220, w: 150, h: 22, style: 'bus' }, // Node C platform
        { x: 2860, y: 460, w: 940, h: 80, style: 'rack' },
        // Bulkhead gate requiring 3 terminals
        { x: 3400, y: 220, w: 20, h: 240, style: 'bulkhead', active: true }
      ],
      terminals: [
        { x: 630, y: 220, id: 'node-a', label: 'AUTH_NODE_A', text: 'NODE A AUTHORIZED [1/3].' },
        { x: 1610, y: 160, id: 'node-b', label: 'AUTH_NODE_B', text: 'NODE B AUTHORIZED [2/3].' },
        { x: 2690, y: 160, id: 'node-c', label: 'AUTH_NODE_C', text: 'NODE C AUTHORIZED [3/3]. BULKHEAD UNLOCKED.' }
      ],
      collectibles: [
        { x: 200, y: 410, type: 'packet' },
        { x: 450, y: 320, type: 'bit' },
        { x: 700, y: 220, type: 'token', index: 0 },
        { x: 940, y: 410, type: 'fragment' },
        { x: 1440, y: 260, type: 'byte' },
        { x: 1680, y: 160, type: 'token', index: 1 },
        { x: 1940, y: 410, type: 'packet' },
        { x: 2520, y: 260, type: 'byte' },
        { x: 2760, y: 160, type: 'token', index: 2 },
        { x: 3100, y: 410, type: 'fragment' }
      ],
      enemies: [
        { type: 'drone', x: 480, y: 320, minX: 400, maxX: 600, speed: 1.4 },
        { type: 'bug', x: 960, y: 436, minX: 820, maxX: 1140, speed: 1.5 },
        { type: 'memleak', x: 1980, y: 380, range: 280, speed: 1.0 },
        { type: 'null', x: 3060, y: 436, minX: 2880, maxX: 3350, speed: 1.6 }
      ],
      goal: { x: 3650, y: 380 }
    },

    {
      id: 10,
      name: 'Core Restore',
      subtitle: 'MASTER CORE REBOOT // ULTIMATE SYSTEM RESTORATION',
      difficulty: 'GRAND FINALE',
      width: 4200,
      hazards: 'FANS, CRUMBLING RAM, FIREWALL BEAMS, NULL ENTITIES',
      objective: 'Overcome the final synthesis obstacle course and restore the Master Core.',
      spawn: { x: 80, y: 380 },
      checkpoint: { x: 2100, y: 380 },
      platforms: [
        { x: 0, y: 460, w: 340, h: 80, style: 'rack' },
        // Phase 1: Fan boost
        { x: 360, y: 470, w: 90, h: 70, style: 'fan', liftForce: 0.95 },
        { x: 480, y: 220, w: 150, h: 22, style: 'bus' },
        { x: 700, y: 320, w: 130, h: 22, style: 'bus' },
        { x: 900, y: 460, w: 360, h: 80, style: 'rack' },
        // Phase 2: Blinking code + switch
        { x: 1320, y: 390, w: 100, h: 22, style: 'blinking', cycle: 140, phase: 0 },
        { x: 1480, y: 310, w: 100, h: 22, style: 'blinking', cycle: 140, phase: 70 },
        { x: 1640, y: 230, w: 140, h: 22, style: 'bus' }, // Switch 1 platform
        { x: 1840, y: 460, w: 460, h: 80, style: 'rack' },
        // Laser guarding middle sector
        { x: 2160, y: 220, w: 16, h: 240, style: 'laser', laserId: 1, active: true },
        // Phase 3: Crumble bridge
        { x: 2360, y: 410, w: 80, h: 22, style: 'crumble' },
        { x: 2490, y: 350, w: 80, h: 22, style: 'crumble' },
        { x: 2620, y: 290, w: 80, h: 22, style: 'crumble' },
        { x: 2750, y: 230, w: 140, h: 22, style: 'bus' },
        // Fan 2 to climax
        { x: 2940, y: 470, w: 90, h: 70, style: 'fan', liftForce: 0.96 },
        { x: 3080, y: 200, w: 160, h: 22, style: 'bus' },
        { x: 3300, y: 340, w: 140, h: 22, style: 'bus' },
        { x: 3500, y: 460, w: 700, h: 80, style: 'rack' }
      ],
      switches: [
        { x: 1700, y: 180, id: 1, active: false, label: 'MASTER_BYPASS' }
      ],
      collectibles: [
        { x: 200, y: 410, type: 'packet' },
        { x: 540, y: 160, type: 'token', index: 0 },
        { x: 760, y: 260, type: 'fragment' },
        { x: 1040, y: 410, type: 'byte' },
        { x: 1700, y: 130, type: 'token', index: 1 },
        { x: 1960, y: 410, type: 'packet' },
        { x: 2660, y: 230, type: 'fragment' },
        { x: 3140, y: 140, type: 'token', index: 2 },
        { x: 3360, y: 280, type: 'packet' },
        { x: 3750, y: 410, type: 'fragment' },
        { x: 3850, y: 410, type: 'packet' }
      ],
      enemies: [
        { type: 'drone', x: 580, y: 260, minX: 480, maxX: 720, speed: 1.5 },
        { type: 'bug', x: 1040, y: 436, minX: 920, maxX: 1220, speed: 1.6 },
        { type: 'packet', x: 1960, y: 436, minX: 1860, maxX: 2120, speed: 2.7 },
        { type: 'null', x: 3160, y: 160, minX: 3080, maxX: 3380, speed: 1.5 },
        { type: 'memleak', x: 3680, y: 380, range: 280, speed: 1.1 }
      ],
      terminals: [
        { x: 1040, y: 400, id: 'term-core-1', label: 'CPU_CORE_0', text: 'PRIMARY BUS ALIGNED // READY FOR FINAL RESTORATION.' }
      ],
      goal: { x: 4020, y: 380 }
    }
  ];

  // ─────────────────────────────────────────────────────────────────────────
  // STATE MANAGEMENT & LOCAL STORAGE
  // ─────────────────────────────────────────────────────────────────────────
  let appState = {
    unlockedLevels: [1], // Level 1 is always unlocked
    completedLevels: [],
    levelHighScores: {},
    levelBestTimes: {},
    tokensCollected: {}, // { "lvl_idx": [0, 1, 2] }
    totalScore: 0,
    totalBits: 0,
    audioEnabled: false
  };

  function loadSavedState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          appState = Object.assign({}, appState, parsed);
        }
      }
      if (!Array.isArray(appState.unlockedLevels) || appState.unlockedLevels.length === 0) {
        appState.unlockedLevels = [1];
      }
    } catch (e) {
      console.warn('Tech Runner: LocalStorage load error', e);
    }
  }

  function saveAppState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(appState));
    } catch (e) {
      console.warn('Tech Runner: LocalStorage save error', e);
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // GAME INSTANCE & RUNTIME VARIABLES
  // ─────────────────────────────────────────────────────────────────────────
  let isModalOpen = false;
  let rafId = null;
  let lastTime = 0;
  let activeLevelIndex = 0; // 0-indexed (0 to 9)
  let gameState = 'menu'; // 'menu' | 'boot' | 'levels' | 'playing' | 'paused' | 'gameover' | 'victory' | 'grand_victory'

  // Level runtime instance clones
  let currentLevel = null;
  let cameraX = 0;
  let levelTimer = 0;
  let score = 0;
  let bitsCount = 0;
  let lives = 3;
  let checkpointSaved = false;
  let activeCheckpointPos = null;
  let terminalMessage = null;
  let terminalMessageTimer = 0;
  let floatingTexts = [];
  let particles = [];

  // Input states
  const keys = {
    left: false,
    right: false,
    jump: false,
    action: false
  };

  // Player object
  const player = {
    x: 80,
    y: 380,
    w: 28,
    h: 42,
    vx: 0,
    vy: 0,
    speed: 4.4,
    jumpForce: -9.8,
    doubleJumpForce: -8.6,
    grounded: false,
    canDoubleJump: true,
    coyoteTimer: 0,
    jumpBufferTimer: 0,
    facing: 1, // 1 = right, -1 = left
    animTimer: 0,
    runFrame: 0,
    invincibleTimer: 0,
    stompBounce: false,
    activeFan: false
  };

  // ─────────────────────────────────────────────────────────────────────────
  // DOM ELEMENT REFERENCES
  // ─────────────────────────────────────────────────────────────────────────
  let overlay, canvas, ctx, stage;
  let statusTextEl, topLevelEl, topScoreEl, topBitsEl, topLivesEl;
  let audioToggleBtn, audioStateEl, openLevelsBtn, exitTopBtn;
  let screenMenu, screenBoot, screenLevels, screenPause, screenGameover, screenVictory, screenGrandVictory;
  let levelsGridEl;
  let touchControlsEl, btnLeft, btnRight, btnJump, btnAction;
  let rotatePromptEl, rotateToggleBtn, rotateLockBtn, rotateForceBtn, rotateDismissBtn;
  let isForcedLandscape = false;
  let rotatePromptDismissed = false;
  let openBtn;

  // ─────────────────────────────────────────────────────────────────────────
  // LEVEL LIFECYCLE & INITIALIZATION
  // ─────────────────────────────────────────────────────────────────────────
  function initLevel(levelIdx, fromCheckpoint) {
    activeLevelIndex = levelIdx;
    const def = LEVELS_DATA[levelIdx];
    if (!def) return;

    // Clone data for active simulation
    currentLevel = {
      id: def.id,
      name: def.name,
      subtitle: def.subtitle,
      width: def.width,
      gravity: def.gravity || 0.48,
      requiredTerminals: def.requiredTerminals || 0,
      terminalsHacked: 0,
      platforms: def.platforms.map(p => ({
        ...p,
        origX: p.x,
        origY: p.y,
        dir: 1,
        shakeTimer: 0,
        fallen: false,
        respawnTimer: 0,
        cycleTimer: p.phase || 0
      })),
      switches: (def.switches || []).map(s => ({ ...s, active: false })),
      terminals: (def.terminals || []).map(t => ({ ...t, hacked: false })),
      collectibles: def.collectibles.map(c => ({
        ...c,
        collected: false,
        bobAngle: Math.random() * Math.PI * 2
      })),
      enemies: def.enemies.map(e => ({
        ...e,
        origX: e.x,
        origY: e.y,
        vx: (e.speed || 1.2) * (Math.random() > 0.5 ? 1 : -1),
        vy: 0,
        w: e.type === 'drone' ? 32 : (e.type === 'packet' ? 24 : 26),
        h: e.type === 'drone' ? 22 : (e.type === 'packet' ? 24 : 22),
        alive: true,
        phase: Math.random() * Math.PI * 2,
        glitchTimer: 0
      })),
      checkpoint: { ...def.checkpoint, reached: false },
      goal: { ...def.goal, reached: false }
    };

    // Restore player spawn
    const spawn = fromCheckpoint && activeCheckpointPos ? activeCheckpointPos : def.spawn;
    player.x = spawn.x;
    player.y = spawn.y;
    player.vx = 0;
    player.vy = 0;
    player.grounded = false;
    player.canDoubleJump = true;
    player.coyoteTimer = 0;
    player.jumpBufferTimer = 0;
    player.invincibleTimer = fromCheckpoint ? 60 : 30;

    cameraX = Math.max(0, Math.min(player.x - 300, currentLevel.width - V_WIDTH));
    levelTimer = 0;
    floatingTexts = [];
    particles = [];
    terminalMessage = null;
    terminalMessageTimer = 0;

    updateHUD();
  }

  function addFloatingText(x, y, text, color) {
    floatingTexts.push({
      x,
      y,
      text,
      color: color || '#d5fb78',
      life: 60,
      vy: -1.2
    });
  }

  function addExplosion(x, y, color, count) {
    for (let i = 0; i < (count || 14); i++) {
      const angle = Math.random() * Math.PI * 2;
      const spd = 1.5 + Math.random() * 4.5;
      particles.push({
        x,
        y,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd,
        size: 2 + Math.random() * 3,
        color: color || '#d5fb78',
        life: 25 + Math.floor(Math.random() * 20),
        alpha: 1
      });
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // PHYSICS & UPDATE LOOP
  // ─────────────────────────────────────────────────────────────────────────
  function update(dt) {
    if (gameState !== 'playing' || !currentLevel) return;

    levelTimer += dt;

    // Coyote & jump buffer counters
    if (player.coyoteTimer > 0) player.coyoteTimer--;
    if (player.jumpBufferTimer > 0) player.jumpBufferTimer--;
    if (player.invincibleTimer > 0) player.invincibleTimer--;
    if (terminalMessageTimer > 0) {
      terminalMessageTimer--;
      if (terminalMessageTimer <= 0) terminalMessage = null;
    }

    // Horizontal acceleration
    const accel = 0.85;
    const friction = player.grounded ? 0.76 : 0.88;

    if (keys.left && !keys.right) {
      player.vx = Math.max(player.vx - accel, -player.speed);
      player.facing = -1;
      player.runFrame += 0.22;
    } else if (keys.right && !keys.left) {
      player.vx = Math.min(player.vx + accel, player.speed);
      player.facing = 1;
      player.runFrame += 0.22;
    } else {
      player.vx *= friction;
      if (Math.abs(player.vx) < 0.15) {
        player.vx = 0;
        player.runFrame = 0;
      }
    }

    // Jump execution (buffered / coyote / double-jump)
    if (player.jumpBufferTimer > 0) {
      if (player.grounded || player.coyoteTimer > 0) {
        player.vy = player.jumpForce;
        player.grounded = false;
        player.coyoteTimer = 0;
        player.jumpBufferTimer = 0;
        player.canDoubleJump = true;
        Sound.jump();
        addExplosion(player.x + player.w / 2, player.y + player.h, '#d5fb78', 6);
      } else if (player.canDoubleJump) {
        player.vy = player.doubleJumpForce;
        player.canDoubleJump = false;
        player.jumpBufferTimer = 0;
        Sound.doubleJump();
        addExplosion(player.x + player.w / 2, player.y + player.h, '#00e5ff', 9);
      }
    }

    // Variable jump height damping when releasing jump early
    if (!keys.jump && player.vy < -3.5) {
      player.vy *= 0.72;
    }

    // Gravity
    player.vy += currentLevel.gravity;
    if (player.vy > 14) player.vy = 14;

    // Update platforms (moving, crumbling, blinking)
    currentLevel.platforms.forEach(p => {
      if (p.style === 'moving') {
        if (p.axis === 'x') {
          p.x += (p.speed || 1.2) * p.dir;
          if (p.x > p.origX + p.dx) p.dir = -1;
          if (p.x < p.origX) p.dir = 1;
        } else if (p.axis === 'y') {
          p.y += (p.speed || 1.2) * p.dir;
          if (p.y > p.origY + p.dx) p.dir = -1;
          if (p.y < p.origY) p.dir = 1;
        }
      } else if (p.style === 'blinking') {
        p.cycleTimer = (p.cycleTimer + 1) % p.cycle;
        p.active = p.cycleTimer < p.cycle * 0.55;
      } else if (p.style === 'crumble') {
        if (p.shakeTimer > 0) {
          p.shakeTimer--;
          if (p.shakeTimer <= 0) {
            p.fallen = true;
            p.respawnTimer = 180;
            addExplosion(p.x + p.w / 2, p.y + p.h / 2, '#c084fc', 8);
          }
        }
        if (p.fallen && p.respawnTimer > 0) {
          p.respawnTimer--;
          if (p.respawnTimer <= 0) {
            p.fallen = false;
            p.shakeTimer = 0;
          }
        }
      }
    });

    // Sub-pixel position updates & platform collision
    player.grounded = false;
    player.activeFan = false;

    // Horizontal sweep
    player.x += player.vx;
    if (player.x < 0) {
      player.x = 0;
      player.vx = 0;
    }
    if (player.x + player.w > currentLevel.width) {
      player.x = currentLevel.width - player.w;
      player.vx = 0;
    }

    currentLevel.platforms.forEach(p => {
      if (p.fallen || p.active === false) return;
      if (p.style === 'fan' || p.style === 'laser') return;

      // Solid collision
      if (rectsIntersect(player.x, player.y, player.w, player.h, p.x, p.y, p.w, p.h)) {
        if (player.vx > 0) {
          player.x = p.x - player.w;
          player.vx = 0;
        } else if (player.vx < 0) {
          player.x = p.x + p.w;
          player.vx = 0;
        }
      }
    });

    // Vertical sweep
    player.y += player.vy;

    currentLevel.platforms.forEach(p => {
      if (p.fallen || p.active === false) return;

      // Fan updraft logic
      if (p.style === 'fan') {
        if (player.x + player.w > p.x && player.x < p.x + p.w && player.y + player.h >= p.y - 180 && player.y <= p.y + p.h) {
          player.vy = Math.min(player.vy - (p.liftForce || 0.9), -7.5);
          player.canDoubleJump = true;
          player.activeFan = true;
          if (Math.random() < 0.25) Sound.fan();
          particles.push({
            x: p.x + Math.random() * p.w,
            y: p.y,
            vx: (Math.random() - 0.5) * 1.5,
            vy: -4 - Math.random() * 4,
            size: 2,
            color: '#00e5ff',
            life: 20,
            alpha: 0.8
          });
        }
        return;
      }

      // Laser barrier check
      if (p.style === 'laser' && p.active !== false) {
        if (rectsIntersect(player.x, player.y, player.w, player.h, p.x, p.y, p.w, p.h)) {
          handlePlayerHit();
          return;
        }
      }

      // Solid vertical landing / bonk
      if (rectsIntersect(player.x, player.y, player.w, player.h, p.x, p.y, p.w, p.h)) {
        if (player.vy > 0 && player.y + player.h - player.vy <= p.y + 12) {
          // Landed on top
          player.y = p.y - player.h;
          player.vy = 0;
          player.grounded = true;
          player.coyoteTimer = 6;
          player.canDoubleJump = true;

          // Crumble platform trigger
          if (p.style === 'crumble' && p.shakeTimer === 0) {
            p.shakeTimer = 45;
          }

          // If platform is moving horizontally, carry player
          if (p.style === 'moving' && p.axis === 'x') {
            player.x += (p.speed || 1.2) * p.dir;
          }
        } else if (player.vy < 0 && player.y - player.vy >= p.y + p.h - 10) {
          // Bonked ceiling
          player.y = p.y + p.h;
          player.vy = 0;
        }
      }
    });

    // Pit fall death
    if (player.y > V_HEIGHT + 60) {
      handlePlayerHit();
      return;
    }

    // Collectibles pick-up
    currentLevel.collectibles.forEach(c => {
      if (c.collected) return;
      c.bobAngle += 0.05;

      const size = c.type === 'token' ? 22 : 16;
      if (rectsIntersect(player.x, player.y, player.w, player.h, c.x - size / 2, c.y - size / 2, size, size)) {
        c.collected = true;

        if (c.type === 'bit') {
          score += 100;
          bitsCount += 1;
          Sound.bit();
          addFloatingText(c.x, c.y, '+100', '#d5fb78');
          addExplosion(c.x, c.y, '#d5fb78', 8);
        } else if (c.type === 'byte') {
          score += 500;
          bitsCount += 8;
          Sound.byte();
          addFloatingText(c.x, c.y, '+500 (BYTE)', '#00e5ff');
          addExplosion(c.x, c.y, '#00e5ff', 12);
        } else if (c.type === 'packet') {
          score += 1000;
          bitsCount += 16;
          Sound.packet();
          addFloatingText(c.x, c.y, '+1,000 (PACKET)', '#f59e0b');
          addExplosion(c.x, c.y, '#f59e0b', 14);
        } else if (c.type === 'fragment') {
          score += 2500;
          Sound.packet();
          addFloatingText(c.x, c.y, '+2,500 (CODE FRAG)', '#c084fc');
          addExplosion(c.x, c.y, '#c084fc', 16);
        } else if (c.type === 'token') {
          score += 5000;
          Sound.token();
          addFloatingText(c.x, c.y, '+5,000 [DEBUG TOKEN]', '#ffd700');
          addExplosion(c.x, c.y, '#ffd700', 20);

          // Save token to state
          const lvlKey = String(currentLevel.id);
          if (!appState.tokensCollected[lvlKey]) appState.tokensCollected[lvlKey] = [];
          if (!appState.tokensCollected[lvlKey].includes(c.index)) {
            appState.tokensCollected[lvlKey].push(c.index);
            saveAppState();
          }
        }

        // Life bonus at every 100 bits
        if (bitsCount >= 100) {
          bitsCount -= 100;
          lives = Math.min(lives + 1, 5);
          Sound.checkpoint();
          addFloatingText(player.x, player.y - 20, '+1 EXTRA LIFE!', '#d5fb78');
        }

        updateHUD();
      }
    });

    // Checkpoint trigger
    if (currentLevel.checkpoint && !currentLevel.checkpoint.reached) {
      const cp = currentLevel.checkpoint;
      if (Math.abs(player.x - cp.x) < 32 && Math.abs(player.y - cp.y) < 60) {
        cp.reached = true;
        checkpointSaved = true;
        activeCheckpointPos = { x: cp.x, y: cp.y };
        Sound.checkpoint();
        addFloatingText(cp.x, cp.y - 30, 'CHECKPOINT // STATE SAVED', '#d5fb78');
        addExplosion(cp.x, cp.y, '#d5fb78', 18);
      }
    }

    // Switch toggles (jump into or interact)
    if (currentLevel.switches) {
      currentLevel.switches.forEach(sw => {
        const dist = Math.hypot((player.x + player.w / 2) - sw.x, (player.y + player.h / 2) - sw.y);
        if (dist < 42 && (keys.action || player.vy > 0)) {
          if (!sw.active) {
            sw.active = true;
            Sound.switchFlip();
            addFloatingText(sw.x, sw.y - 24, `${sw.label} ACTIVATED`, '#00e5ff');
            addExplosion(sw.x, sw.y, '#00e5ff', 12);

            // Toggle corresponding platforms/lasers
            currentLevel.platforms.forEach(p => {
              if (p.switchId === sw.id) p.active = true;
              if (p.laserId === sw.id) p.active = false;
            });
          }
        }
      });
    }

    // Terminal access
    if (currentLevel.terminals) {
      currentLevel.terminals.forEach(tm => {
        const dist = Math.hypot((player.x + player.w / 2) - tm.x, (player.y + player.h / 2) - tm.y);
        if (dist < 48) {
          if (!tm.hacked && keys.action) {
            tm.hacked = true;
            currentLevel.terminalsHacked++;
            score += 1500;
            Sound.terminal();
            terminalMessage = tm.text;
            terminalMessageTimer = 220;
            addFloatingText(tm.x, tm.y - 20, `[AUTH GRANTED: ${tm.label}]`, '#d5fb78');
            addExplosion(tm.x, tm.y, '#d5fb78', 16);

            // Level 9 bulkhead check
            if (currentLevel.requiredTerminals && currentLevel.terminalsHacked >= currentLevel.requiredTerminals) {
              currentLevel.platforms.forEach(p => {
                if (p.style === 'bulkhead') p.active = false;
              });
              addFloatingText(tm.x, tm.y - 45, 'BULKHEAD DOOR OPENED // SECTOR UNLOCKED', '#00e5ff');
            }
          }
        }
      });
    }

    // Enemies update & collision
    currentLevel.enemies.forEach(en => {
      if (!en.alive) return;

      if (en.type === 'bug' || en.type === 'packet') {
        en.x += en.vx;
        if (en.x <= en.minX) {
          en.x = en.minX;
          en.vx = Math.abs(en.vx);
        } else if (en.x >= en.maxX) {
          en.x = en.maxX;
          en.vx = -Math.abs(en.vx);
        }
      } else if (en.type === 'drone') {
        en.x += en.vx;
        en.phase += 0.04;
        en.y = en.origY + Math.sin(en.phase) * 16;
        if (en.x <= en.minX) {
          en.x = en.minX;
          en.vx = Math.abs(en.vx);
        } else if (en.x >= en.maxX) {
          en.x = en.maxX;
          en.vx = -Math.abs(en.vx);
        }
      } else if (en.type === 'memleak') {
        // Slowly drifts towards player when close
        const dx = (player.x + player.w / 2) - en.x;
        const dy = (player.y + player.h / 2) - en.y;
        const dist = Math.hypot(dx, dy);
        if (dist < (en.range || 260)) {
          en.x += (dx / dist) * (en.speed || 0.9);
          en.y += (dy / dist) * (en.speed || 0.9);
        }
      } else if (en.type === 'null') {
        en.x += en.vx;
        en.glitchTimer = (en.glitchTimer + 1) % 60;
        if (en.x <= en.minX) {
          en.x = en.minX;
          en.vx = Math.abs(en.vx);
        } else if (en.x >= en.maxX) {
          en.x = en.maxX;
          en.vx = -Math.abs(en.vx);
        }
      }

      // Check collision with player
      if (rectsIntersect(player.x, player.y, player.w, player.h, en.x, en.y, en.w, en.h)) {
        // Stomp condition: player is falling and player bottom is near enemy top
        const playerBottom = player.y + player.h;
        const enemyTop = en.y;
        if (player.vy > 0 && playerBottom - player.vy <= enemyTop + 14) {
          // Stomp success!
          en.alive = false;
          player.vy = -7.8; // Bounce
          player.canDoubleJump = true;
          score += 400;
          Sound.stomp();
          addFloatingText(en.x, en.y, '+400 (DEBUGGED)', '#d5fb78');
          addExplosion(en.x + en.w / 2, en.y + en.h / 2, en.type === 'memleak' ? '#c084fc' : '#d5fb78', 16);
          updateHUD();
        } else {
          handlePlayerHit();
        }
      }
    });

    // Level Goal completion
    if (currentLevel.goal && !currentLevel.goal.reached) {
      const g = currentLevel.goal;
      if (rectsIntersect(player.x, player.y, player.w, player.h, g.x, g.y, 48, 64)) {
        g.reached = true;
        handleLevelComplete();
      }
    }

    // Camera follow player smoothly
    const targetCamX = player.x - 300;
    cameraX += (targetCamX - cameraX) * 0.12;
    cameraX = Math.max(0, Math.min(cameraX, currentLevel.width - V_WIDTH));

    // Update floating texts
    for (let i = floatingTexts.length - 1; i >= 0; i--) {
      const ft = floatingTexts[i];
      ft.y += ft.vy;
      ft.life--;
      if (ft.life <= 0) floatingTexts.splice(i, 1);
    }

    // Update particles
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life--;
      p.alpha = Math.max(0, p.life / 30);
      if (p.life <= 0) particles.splice(i, 1);
    }
  }

  function handlePlayerHit() {
    if (player.invincibleTimer > 0) return;

    Sound.hit();
    lives--;
    addExplosion(player.x + player.w / 2, player.y + player.h / 2, '#ff4757', 24);
    updateHUD();

    if (lives <= 0) {
      // System Failure
      gameState = 'gameover';
      showScreen('gameover');
      const failScoreEl = document.getElementById('tr-fail-score');
      const failLevelEl = document.getElementById('tr-fail-level');
      const failBitsEl = document.getElementById('tr-fail-bits');
      if (failScoreEl) failScoreEl.textContent = String(score).padStart(5, '0');
      if (failLevelEl) failLevelEl.textContent = String(activeLevelIndex + 1).padStart(2, '0');
      if (failBitsEl) failBitsEl.textContent = String(bitsCount);
    } else {
      // Respawn at checkpoint or start
      const spawn = activeCheckpointPos || LEVELS_DATA[activeLevelIndex].spawn;
      player.x = spawn.x;
      player.y = spawn.y;
      player.vx = 0;
      player.vy = 0;
      player.invincibleTimer = 90;
      addFloatingText(player.x, player.y - 20, 'RESTORED FROM CHECKPOINT', '#00e5ff');
    }
  }

  function handleLevelComplete() {
    const isGrandFinale = activeLevelIndex === 9; // Level 10 completed!
    if (isGrandFinale) {
      Sound.grandWin();
    } else {
      Sound.levelWin();
    }

    // Time bonus
    const timeBonus = Math.max(200, Math.floor(6000 - levelTimer * 50));
    score += timeBonus;
    appState.totalScore += score;
    appState.totalBits += bitsCount;

    // Unlock next level
    const nextLvlNum = activeLevelIndex + 2;
    if (nextLvlNum <= 10 && !appState.unlockedLevels.includes(nextLvlNum)) {
      appState.unlockedLevels.push(nextLvlNum);
    }
    if (!appState.completedLevels.includes(activeLevelIndex + 1)) {
      appState.completedLevels.push(activeLevelIndex + 1);
    }

    // High scores
    const lvlKey = String(activeLevelIndex + 1);
    if (!appState.levelHighScores[lvlKey] || score > appState.levelHighScores[lvlKey]) {
      appState.levelHighScores[lvlKey] = score;
    }
    const completionTimeSec = parseFloat(levelTimer.toFixed(1));
    if (!appState.levelBestTimes[lvlKey] || completionTimeSec < appState.levelBestTimes[lvlKey]) {
      appState.levelBestTimes[lvlKey] = completionTimeSec;
    }

    saveAppState();
    updateMenuStats();

    if (isGrandFinale) {
      gameState = 'grand_victory';
      showScreen('grand_victory');

      const grandScoreEl = document.getElementById('tr-grand-score');
      const grandBitsEl = document.getElementById('tr-grand-bits');
      const grandTokensEl = document.getElementById('tr-grand-tokens');
      if (grandScoreEl) grandScoreEl.textContent = String(appState.totalScore).padStart(5, '0');
      if (grandBitsEl) grandBitsEl.textContent = String(appState.totalBits);

      // Count total tokens found across all sectors
      let totalTokensFound = 0;
      Object.values(appState.tokensCollected).forEach(arr => {
        totalTokensFound += arr.length;
      });
      if (grandTokensEl) grandTokensEl.textContent = `${totalTokensFound} / 30`;
    } else {
      gameState = 'victory';
      showScreen('victory');

      const vicTitleEl = document.getElementById('tr-vic-title');
      const vicSubEl = document.getElementById('tr-vic-subtitle');
      const vicScoreEl = document.getElementById('tr-vic-score');
      const vicTimeBonusEl = document.getElementById('tr-vic-time-bonus');
      const vicBitsEl = document.getElementById('tr-vic-bits');
      const vicTokensEl = document.getElementById('tr-vic-tokens');
      const vicTotalScoreEl = document.getElementById('tr-vic-total-score');

      const def = LEVELS_DATA[activeLevelIndex];
      if (vicTitleEl) vicTitleEl.textContent = `SECTOR ${String(def.id).padStart(2, '0')}: ${def.name} RESTORED`;
      if (vicSubEl) vicSubEl.textContent = 'HARDWARE / NETWORK STABILIZED';
      if (vicScoreEl) vicScoreEl.textContent = `+${score}`;
      if (vicTimeBonusEl) vicTimeBonusEl.textContent = `+${timeBonus}`;
      if (vicBitsEl) vicBitsEl.textContent = `${bitsCount} BITS`;

      const tokensArr = appState.tokensCollected[String(def.id)] || [];
      if (vicTokensEl) vicTokensEl.textContent = `${tokensArr.length} / 3`;
      if (vicTotalScoreEl) vicTotalScoreEl.textContent = String(appState.totalScore).padStart(5, '0');
    }
  }

  function rectsIntersect(x1, y1, w1, h1, x2, y2, w2, h2) {
    return x1 < x2 + w2 && x1 + w1 > x2 && y1 < y2 + h2 && y1 + h1 > y2;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // CANVAS RENDERING ENGINE
  // ─────────────────────────────────────────────────────────────────────────
  function render() {
    if (!ctx || !currentLevel) return;

    if (gameState !== 'playing' && gameState !== 'paused') {
      // Lightweight backdrop when in menus to avoid heavy entity passes
      ctx.save();
      ctx.clearRect(0, 0, V_WIDTH, V_HEIGHT);
      ctx.fillStyle = '#080a07';
      ctx.fillRect(0, 0, V_WIDTH, V_HEIGHT);
      renderCircuitGrid(cameraX * 0.25);
      ctx.restore();
      return;
    }

    ctx.save();
    ctx.clearRect(0, 0, V_WIDTH, V_HEIGHT);

    // Dark technical background
    ctx.fillStyle = '#080a07';
    ctx.fillRect(0, 0, V_WIDTH, V_HEIGHT);

    // Parallax background layer 1: Subtle circuit trace grid
    renderCircuitGrid(cameraX * 0.25);

    // Parallax background layer 2: Server rack skyline with blinking LED nodes
    renderServerBackdrop(cameraX * 0.45);

    // World camera translation
    ctx.save();
    ctx.translate(-Math.floor(cameraX), 0);

    // Render fan airflow columns
    renderFanDrafts();

    // Render platforms & lasers
    renderPlatforms();

    // Render switches & terminals
    renderSwitchesAndTerminals();

    // Render checkpoints & goal core
    renderCheckpointsAndGoal();

    // Render collectibles
    renderCollectibles();

    // Render enemies
    renderEnemies();

    // Render player
    renderPlayer();

    // Render particles & floating text
    renderParticles();
    renderFloatingTexts();

    ctx.restore(); // End world camera

    // Render on-screen HUD (in-canvas scanlines & notifications)
    renderCanvasHUD();

    ctx.restore();
  }

  function renderCircuitGrid(offset) {
    ctx.save();
    ctx.strokeStyle = 'rgba(38, 44, 34, 0.45)';
    ctx.lineWidth = 1;

    const gridSize = 40;
    const startX = -(offset % gridSize);

    ctx.beginPath();
    for (let x = startX; x < V_WIDTH; x += gridSize) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, V_HEIGHT);
    }
    for (let y = 0; y < V_HEIGHT; y += gridSize) {
      ctx.moveTo(0, y);
      ctx.lineTo(V_WIDTH, y);
    }
    ctx.stroke();

    // Random blinking circuit nodes
    ctx.fillStyle = 'rgba(213, 251, 120, 0.12)';
    for (let i = 0; i < 8; i++) {
      const nx = ((i * 137) - (offset * 0.5)) % V_WIDTH;
      const ny = (i * 73) % V_HEIGHT;
      ctx.fillRect(nx < 0 ? nx + V_WIDTH : nx, ny, 3, 3);
    }
    ctx.restore();
  }

  function renderServerBackdrop(offset) {
    ctx.save();
    const rackWidth = 80;
    const count = Math.ceil(V_WIDTH / rackWidth) + 2;
    const startX = -(offset % rackWidth);

    for (let i = -1; i < count; i++) {
      const rx = startX + i * rackWidth;
      const rHeight = 220 + ((i * 37) % 140);
      const ry = V_HEIGHT - rHeight;

      // Dark rack body
      ctx.fillStyle = '#0e110d';
      ctx.fillRect(rx, ry, rackWidth - 8, rHeight);
      ctx.strokeStyle = '#1a1f17';
      ctx.strokeRect(rx, ry, rackWidth - 8, rHeight);

      // Server unit slots & blinking LEDs
      for (let s = ry + 12; s < V_HEIGHT - 20; s += 24) {
        ctx.fillStyle = '#141812';
        ctx.fillRect(rx + 6, s, rackWidth - 20, 16);

        // Green / Cyan status LED
        const isBlinking = ((Date.now() / 350 + i + s) % 4) > 2;
        ctx.fillStyle = isBlinking ? '#d5fb78' : '#00e5ff';
        ctx.fillRect(rx + rackWidth - 22, s + 6, 4, 4);
      }
    }
    ctx.restore();
  }

  let cachedFanGrad = null;

  function renderFanDrafts() {
    const viewLeft = cameraX - 80;
    const viewRight = cameraX + V_WIDTH + 80;

    if (!cachedFanGrad) {
      cachedFanGrad = ctx.createLinearGradient(0, 0, 0, -180);
      cachedFanGrad.addColorStop(0, 'rgba(0, 229, 255, 0.22)');
      cachedFanGrad.addColorStop(1, 'rgba(0, 229, 255, 0.0)');
    }

    currentLevel.platforms.forEach(p => {
      if (p.style !== 'fan') return;
      if (p.x + p.w < viewLeft || p.x > viewRight) return;

      ctx.save();
      ctx.translate(0, p.y);
      ctx.fillStyle = cachedFanGrad;
      ctx.fillRect(p.x, -180, p.w, 180);

      // Air streak lines
      ctx.strokeStyle = 'rgba(0, 229, 255, 0.45)';
      ctx.lineWidth = 1;
      const t = Date.now() * 0.008;
      for (let i = 0; i < 4; i++) {
        const lx = p.x + 12 + i * 20;
        const ly = -((t * 80 + i * 40) % 170);
        ctx.beginPath();
        ctx.moveTo(lx, ly);
        ctx.lineTo(lx, ly - 22);
        ctx.stroke();
      }
      ctx.restore();
    });
  }

  function renderPlatforms() {
    const viewLeft = cameraX - 60;
    const viewRight = cameraX + V_WIDTH + 60;

    currentLevel.platforms.forEach(p => {
      if (p.fallen || p.active === false) return;
      if (p.x + p.w < viewLeft || p.x > viewRight) return;

      ctx.save();

      // Shake animation for crumbling blocks
      let drawX = p.x;
      let drawY = p.y;
      if (p.style === 'crumble' && p.shakeTimer > 0) {
        drawX += (Math.random() - 0.5) * 4;
        drawY += (Math.random() - 0.5) * 4;
      }

      if (p.style === 'rack') {
        // High-density server platform with PCB edge
        ctx.fillStyle = '#141812';
        ctx.fillRect(drawX, drawY, p.w, p.h);
        ctx.strokeStyle = '#2c3526';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(drawX, drawY, p.w, p.h);

        // Top green bus track
        ctx.fillStyle = '#2a3b1d';
        ctx.fillRect(drawX, drawY, p.w, 6);
        ctx.fillStyle = '#d5fb78';
        for (let bx = drawX + 8; bx < drawX + p.w - 8; bx += 24) {
          ctx.fillRect(bx, drawY + 1, 8, 3);
        }
      } else if (p.style === 'bus' || p.style === 'moving') {
        // Floating bus bridge
        ctx.fillStyle = p.style === 'moving' ? '#172218' : '#191f16';
        ctx.fillRect(drawX, drawY, p.w, p.h);
        ctx.strokeStyle = p.style === 'moving' ? '#00e5ff' : '#46563c';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(drawX, drawY, p.w, p.h);

        // Glowing center trace
        ctx.fillStyle = p.style === 'moving' ? '#00e5ff' : '#d5fb78';
        ctx.fillRect(drawX + 6, drawY + p.h / 2 - 1.5, p.w - 12, 3);
      } else if (p.style === 'crumble') {
        // RAM stick platform
        ctx.fillStyle = '#21172a';
        ctx.fillRect(drawX, drawY, p.w, p.h);
        ctx.strokeStyle = '#c084fc';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(drawX, drawY, p.w, p.h);

        // Golden memory contact pins
        ctx.fillStyle = '#f59e0b';
        for (let px = drawX + 4; px < drawX + p.w - 4; px += 10) {
          ctx.fillRect(px, drawY + p.h - 4, 5, 3);
        }
      } else if (p.style === 'blinking') {
        // Code syntax block
        ctx.fillStyle = '#10252a';
        ctx.fillRect(drawX, drawY, p.w, p.h);
        ctx.strokeStyle = '#00e5ff';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(drawX, drawY, p.w, p.h);

        // Code brackets decorative
        ctx.fillStyle = '#00e5ff';
        ctx.font = '9px monospace';
        ctx.fillText('{ ; }', drawX + p.w / 2 - 12, drawY + 14);
      } else if (p.style === 'switchable') {
        // Switchable data bridge
        ctx.fillStyle = 'rgba(0, 229, 255, 0.2)';
        ctx.fillRect(drawX, drawY, p.w, p.h);
        ctx.strokeStyle = '#00e5ff';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(drawX, drawY, p.w, p.h);
      } else if (p.style === 'bulkhead') {
        // Giant sector gate
        ctx.fillStyle = '#2a1a1a';
        ctx.fillRect(drawX, drawY, p.w, p.h);
        ctx.strokeStyle = '#ff4757';
        ctx.lineWidth = 2;
        ctx.strokeRect(drawX, drawY, p.w, p.h);
      } else if (p.style === 'laser') {
        // Pulsing laser beam
        const alpha = 0.65 + Math.sin(Date.now() * 0.02) * 0.35;
        ctx.fillStyle = `rgba(255, 71, 87, ${alpha})`;
        ctx.fillRect(drawX, drawY, p.w, p.h);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(drawX + p.w / 2 - 1.5, drawY, 3, p.h);

        // Emitters at top & bottom
        ctx.fillStyle = '#3a1e22';
        ctx.fillRect(drawX - 4, drawY - 6, p.w + 8, 6);
        ctx.fillRect(drawX - 4, drawY + p.h, p.w + 8, 6);
      }

      ctx.restore();
    });
  }

  function renderSwitchesAndTerminals() {
    const viewLeft = cameraX - 50;
    const viewRight = cameraX + V_WIDTH + 50;

    // Switches
    if (currentLevel.switches) {
      currentLevel.switches.forEach(sw => {
        if (sw.x + 24 < viewLeft || sw.x - 24 > viewRight) return;
        ctx.save();
        ctx.fillStyle = '#1c221a';
        ctx.fillRect(sw.x - 12, sw.y - 20, 24, 20);
        ctx.strokeStyle = sw.active ? '#d5fb78' : '#ff4757';
        ctx.strokeRect(sw.x - 12, sw.y - 20, 24, 20);

        // Switch lever
        ctx.fillStyle = sw.active ? '#d5fb78' : '#ff4757';
        ctx.beginPath();
        ctx.arc(sw.x, sw.y - 10, 5, 0, Math.PI * 2);
        ctx.fill();

        // Label
        ctx.fillStyle = '#a0a598';
        ctx.font = '8px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(sw.active ? '[ON]' : '[OFF]', sw.x, sw.y - 24);
        ctx.restore();
      });
    }

    // Terminals
    if (currentLevel.terminals) {
      currentLevel.terminals.forEach(tm => {
        if (tm.x + 30 < viewLeft || tm.x - 30 > viewRight) return;
        ctx.save();
        // Server console terminal body
        ctx.fillStyle = '#141813';
        ctx.fillRect(tm.x - 14, tm.y - 34, 28, 34);
        ctx.strokeStyle = tm.hacked ? '#d5fb78' : '#00e5ff';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(tm.x - 14, tm.y - 34, 28, 34);

        // Mini CRT Screen
        ctx.fillStyle = tm.hacked ? '#213318' : '#0e242a';
        ctx.fillRect(tm.x - 10, tm.y - 30, 20, 16);
        ctx.fillStyle = tm.hacked ? '#d5fb78' : '#00e5ff';
        ctx.fillRect(tm.x - 8, tm.y - 26, 16, 2);
        ctx.fillRect(tm.x - 8, tm.y - 21, 10, 2);

        // Prompt hint when nearby
        const dist = Math.hypot((player.x + player.w / 2) - tm.x, (player.y + player.h / 2) - tm.y);
        if (dist < 54 && !tm.hacked) {
          ctx.fillStyle = '#00e5ff';
          ctx.font = '9px monospace';
          ctx.textAlign = 'center';
          ctx.fillText('PRESS [E]', tm.x, tm.y - 42);
        }
        ctx.restore();
      });
    }
  }

  function renderCheckpointsAndGoal() {
    const viewLeft = cameraX - 60;
    const viewRight = cameraX + V_WIDTH + 60;

    // Checkpoint
    if (currentLevel.checkpoint) {
      const cp = currentLevel.checkpoint;
      if (cp.x + 20 >= viewLeft && cp.x - 20 <= viewRight) {
        ctx.save();
        ctx.fillStyle = cp.reached ? '#d5fb78' : '#8e9684';
        ctx.fillRect(cp.x - 3, cp.y - 50, 6, 50);

        // Antenna beacon
        ctx.beginPath();
        ctx.arc(cp.x, cp.y - 54, 7, 0, Math.PI * 2);
        ctx.fillStyle = cp.reached ? '#d5fb78' : '#262c22';
        ctx.fill();
        ctx.strokeStyle = cp.reached ? '#ffffff' : '#8e9684';
        ctx.stroke();

        if (cp.reached) {
          // Radiating signal pulse
          ctx.strokeStyle = 'rgba(213, 251, 120, 0.4)';
          ctx.beginPath();
          ctx.arc(cp.x, cp.y - 54, 14 + (Date.now() * 0.02 % 10), 0, Math.PI * 2);
          ctx.stroke();
        }
        ctx.restore();
      }
    }

    // Goal System Core
    if (currentLevel.goal) {
      const g = currentLevel.goal;
      if (g.x + 60 >= viewLeft && g.x - 20 <= viewRight) {
        ctx.save();
        const pulse = Math.sin(Date.now() * 0.005) * 6;

        // Outer containment ring
        ctx.strokeStyle = '#00e5ff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(g.x + 24, g.y + 24, 28 + pulse, 0, Math.PI * 2);
        ctx.stroke();

        // Pulsing Core
        const grad = ctx.createRadialGradient(g.x + 24, g.y + 24, 2, g.x + 24, g.y + 24, 24);
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(0.4, '#d5fb78');
        grad.addColorStop(0.8, '#00e5ff');
        grad.addColorStop(1, 'rgba(0, 229, 255, 0)');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(g.x + 24, g.y + 24, 22, 0, Math.PI * 2);
        ctx.fill();

        // Core pedestal
        ctx.fillStyle = '#191f16';
        ctx.fillRect(g.x + 10, g.y + 48, 28, 20);
        ctx.strokeStyle = '#2c3526';
        ctx.strokeRect(g.x + 10, g.y + 48, 28, 20);

        ctx.fillStyle = '#d5fb78';
        ctx.font = '10px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('SYSTEM CORE', g.x + 24, g.y - 12);
        ctx.restore();
      }
    }
  }

  function renderCollectibles() {
    const viewLeft = cameraX - 50;
    const viewRight = cameraX + V_WIDTH + 50;

    currentLevel.collectibles.forEach(c => {
      if (c.collected) return;
      if (c.x + 20 < viewLeft || c.x - 20 > viewRight) return;
      ctx.save();
      const drawY = c.y + Math.sin(c.bobAngle) * 4;

      if (c.type === 'bit') {
        // Lime diamond
        ctx.fillStyle = '#d5fb78';
        ctx.beginPath();
        ctx.moveTo(c.x, drawY - 7);
        ctx.lineTo(c.x + 6, drawY);
        ctx.lineTo(c.x, drawY + 7);
        ctx.lineTo(c.x - 6, drawY);
        ctx.closePath();
        ctx.fill();
      } else if (c.type === 'byte') {
        // Cyan cube
        ctx.fillStyle = '#00e5ff';
        ctx.fillRect(c.x - 7, drawY - 7, 14, 14);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.strokeRect(c.x - 7, drawY - 7, 14, 14);
      } else if (c.type === 'packet') {
        // Yellow network packet
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(c.x - 9, drawY - 6, 18, 12);
        ctx.strokeStyle = '#ffffff';
        ctx.strokeRect(c.x - 9, drawY - 6, 18, 12);
        ctx.fillStyle = '#ffffff';
        ctx.font = '8px monospace';
        ctx.fillText('UDP', c.x - 7, drawY + 3);
      } else if (c.type === 'fragment') {
        // Hexadecimal code fragment
        ctx.fillStyle = '#c084fc';
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          const a = (i * Math.PI) / 3;
          const hx = c.x + Math.cos(a) * 9;
          const hy = drawY + Math.sin(a) * 9;
          if (i === 0) ctx.moveTo(hx, hy);
          else ctx.lineTo(hx, hy);
        }
        ctx.closePath();
        ctx.fill();
      } else if (c.type === 'token') {
        // Special Debug Token (Gold Coin)
        ctx.fillStyle = '#ffd700';
        ctx.beginPath();
        ctx.arc(c.x, drawY, 11, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffae00';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = '#0a0c09';
        ctx.font = 'bold 9px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('C1', c.x, drawY + 3);
      }
      ctx.restore();
    });
  }

  function renderEnemies() {
    const viewLeft = cameraX - 50;
    const viewRight = cameraX + V_WIDTH + 50;

    currentLevel.enemies.forEach(en => {
      if (!en.alive) return;
      if (en.x + en.w < viewLeft || en.x > viewRight) return;
      ctx.save();

      if (en.type === 'bug') {
        // BUG-01: Green crawler with legs
        ctx.fillStyle = '#1c2817';
        ctx.fillRect(en.x, en.y + 4, en.w, en.h - 4);
        ctx.strokeStyle = '#d5fb78';
        ctx.strokeRect(en.x, en.y + 4, en.w, en.h - 4);

        // Antennae
        ctx.strokeStyle = '#d5fb78';
        ctx.beginPath();
        ctx.moveTo(en.x + 4, en.y + 4);
        ctx.lineTo(en.x + 1, en.y - 3);
        ctx.moveTo(en.x + en.w - 4, en.y + 4);
        ctx.lineTo(en.x + en.w - 1, en.y - 3);
        ctx.stroke();

        // Eyes
        ctx.fillStyle = '#ff4757';
        ctx.fillRect(en.vx > 0 ? en.x + en.w - 6 : en.x + 2, en.y + 7, 4, 3);
      } else if (en.type === 'packet') {
        // PACKET DROP: Red error packet
        ctx.fillStyle = '#3a1318';
        ctx.fillRect(en.x, en.y, en.w, en.h);
        ctx.strokeStyle = '#ff4757';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(en.x, en.y, en.w, en.h);

        ctx.fillStyle = '#ff4757';
        ctx.font = 'bold 9px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('ERR', en.x + en.w / 2, en.y + 16);
      } else if (en.type === 'memleak') {
        // MEM LEAK: Pulsing purple amorphous cluster
        const pulse = Math.sin(Date.now() * 0.008) * 3;
        ctx.fillStyle = '#2d183d';
        ctx.fillRect(en.x - pulse / 2, en.y - pulse / 2, en.w + pulse, en.h + pulse);
        ctx.strokeStyle = '#c084fc';
        ctx.strokeRect(en.x - pulse / 2, en.y - pulse / 2, en.w + pulse, en.h + pulse);

        ctx.fillStyle = '#c084fc';
        ctx.font = '8px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('0xLEAK', en.x + en.w / 2, en.y + 15);
      } else if (en.type === 'drone') {
        // Sentry Drone with cyan scanner cone
        ctx.fillStyle = '#1b2226';
        ctx.fillRect(en.x, en.y, en.w, en.h);
        ctx.strokeStyle = '#00e5ff';
        ctx.strokeRect(en.x, en.y, en.w, en.h);

        // Scanner light cone downwards
        ctx.fillStyle = 'rgba(0, 229, 255, 0.12)';
        ctx.beginPath();
        ctx.moveTo(en.x + en.w / 2, en.y + en.h);
        ctx.lineTo(en.x - 12, en.y + en.h + 45);
        ctx.lineTo(en.x + en.w + 12, en.y + en.h + 45);
        ctx.closePath();
        ctx.fill();
      } else if (en.type === 'null') {
        // NULL PROCESS: Glitch silhouette
        const glitchOffset = en.glitchTimer > 50 ? (Math.random() - 0.5) * 6 : 0;
        ctx.fillStyle = 'rgba(10, 15, 20, 0.85)';
        ctx.fillRect(en.x + glitchOffset, en.y, en.w, en.h);
        ctx.strokeStyle = '#00e5ff';
        ctx.strokeRect(en.x - glitchOffset, en.y, en.w, en.h);

        ctx.fillStyle = '#00e5ff';
        ctx.font = '8px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('NULL', en.x + en.w / 2, en.y + 15);
      }

      ctx.restore();
    });
  }

  function renderPlayer() {
    ctx.save();
    // Invulnerability blinking
    if (player.invincibleTimer > 0 && Math.floor(player.invincibleTimer / 4) % 2 === 0) {
      ctx.restore();
      return;
    }

    const px = player.x;
    const py = player.y;
    const dir = player.facing;

    // Center transform for directional facing
    ctx.translate(px + player.w / 2, py + player.h / 2);
    ctx.scale(dir, 1);

    // Dark hoodie/suit body
    ctx.fillStyle = '#161a15';
    ctx.fillRect(-10, -12, 20, 24);

    // Reflective safety stripes (lime green)
    ctx.fillStyle = '#d5fb78';
    ctx.fillRect(-10, 2, 20, 3);

    // Utility backpack with cyan diagnostic antenna
    ctx.fillStyle = '#262f22';
    ctx.fillRect(-15, -10, 6, 18);
    ctx.strokeStyle = '#00e5ff';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(-12, -10);
    ctx.lineTo(-12, -20);
    ctx.stroke();
    // Blinking antenna dot
    ctx.fillStyle = (Date.now() % 400 < 200) ? '#00e5ff' : '#d5fb78';
    ctx.fillRect(-14, -22, 4, 4);

    // Head / Helmet
    ctx.fillStyle = '#20261e';
    ctx.fillRect(-9, -23, 18, 13);

    // Cyan diagnostic visor (glowing)
    ctx.fillStyle = '#00e5ff';
    ctx.fillRect(1, -19, 8, 5);

    // Handheld multitester tool in front hand
    ctx.fillStyle = '#323f2d';
    ctx.fillRect(7, -4, 8, 12);
    ctx.fillStyle = '#d5fb78';
    ctx.fillRect(9, -2, 4, 4);

    // Animated running legs
    const legOffset = Math.sin(player.runFrame) * 6;
    ctx.fillStyle = '#0f130e';
    if (!player.grounded) {
      // Jump tuck legs
      ctx.fillRect(-8, 12, 7, 7);
      ctx.fillRect(1, 10, 7, 7);
    } else {
      ctx.fillRect(-8, 12, 7, 10 + legOffset);
      ctx.fillRect(1, 12, 7, 10 - legOffset);
    }

    ctx.restore();
  }

  function renderParticles() {
    if (particles.length === 0) return;
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      ctx.globalAlpha = Math.max(0, Math.min(1, p.alpha));
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x, p.y, p.size, p.size);
    }
    ctx.globalAlpha = 1.0;
  }

  function renderFloatingTexts() {
    if (floatingTexts.length === 0) return;
    ctx.save();
    ctx.font = 'bold 11px monospace';
    ctx.textAlign = 'center';
    for (let i = 0; i < floatingTexts.length; i++) {
      const ft = floatingTexts[i];
      ctx.fillStyle = '#000000';
      ctx.fillText(ft.text, ft.x + 1, ft.y + 1); // Crisp shadow without expensive shadowBlur
      ctx.fillStyle = ft.color;
      ctx.fillText(ft.text, ft.x, ft.y);
    }
    ctx.restore();
  }

  function renderCanvasHUD() {
    // Terminal alert banner when active
    if (terminalMessage) {
      ctx.save();
      ctx.fillStyle = 'rgba(10, 14, 9, 0.92)';
      ctx.fillRect(140, 20, V_WIDTH - 280, 36);
      ctx.strokeStyle = '#d5fb78';
      ctx.strokeRect(140, 20, V_WIDTH - 280, 36);

      ctx.fillStyle = '#d5fb78';
      ctx.font = '11px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`> ${terminalMessage}`, V_WIDTH / 2, 42);
      ctx.restore();
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // UI & SCREEN CONTROLLERS
  // ─────────────────────────────────────────────────────────────────────────
  function showScreen(screenId) {
    const screens = [
      screenMenu,
      screenBoot,
      screenLevels,
      screenPause,
      screenGameover,
      screenVictory,
      screenGrandVictory
    ];
    screens.forEach(s => {
      if (s) s.hidden = true;
    });

    if (screenId === 'menu' && screenMenu) screenMenu.hidden = false;
    else if (screenId === 'boot' && screenBoot) screenBoot.hidden = false;
    else if (screenId === 'levels' && screenLevels) {
      screenLevels.hidden = false;
      renderLevelSelectGrid();
    } else if (screenId === 'pause' && screenPause) screenPause.hidden = false;
    else if (screenId === 'gameover' && screenGameover) screenGameover.hidden = false;
    else if (screenId === 'victory' && screenVictory) screenVictory.hidden = false;
    else if (screenId === 'grand_victory' && screenGrandVictory) screenGrandVictory.hidden = false;
  }

  function updateHUD() {
    if (topLevelEl) topLevelEl.textContent = `${String(activeLevelIndex + 1).padStart(2, '0')}/10`;
    if (topScoreEl) topScoreEl.textContent = String(score).padStart(5, '0');
    if (topBitsEl) topBitsEl.textContent = String(bitsCount).padStart(3, '0');
    if (topLivesEl) topLivesEl.textContent = '❤'.repeat(Math.max(0, lives));
  }

  function updateMenuStats() {
    const statSectorsEl = document.getElementById('tr-stat-sectors');
    const statScoreEl = document.getElementById('tr-stat-score');
    const statBitsEl = document.getElementById('tr-stat-bits');
    const statTokensEl = document.getElementById('tr-stat-tokens');

    if (statSectorsEl) statSectorsEl.textContent = `${String(appState.completedLevels.length).padStart(2, '0')} / 10`;
    if (statScoreEl) statScoreEl.textContent = String(appState.totalScore).padStart(5, '0');
    if (statBitsEl) statBitsEl.textContent = String(appState.totalBits);

    let totalTokens = 0;
    Object.values(appState.tokensCollected).forEach(arr => {
      totalTokens += arr.length;
    });
    if (statTokensEl) statTokensEl.textContent = `${String(totalTokens).padStart(2, '0')} / 30`;
  }

  function renderLevelSelectGrid() {
    if (!levelsGridEl) return;
    levelsGridEl.innerHTML = '';

    LEVELS_DATA.forEach((lvl, idx) => {
      const isUnlocked = appState.unlockedLevels.includes(lvl.id);
      const isCompleted = appState.completedLevels.includes(lvl.id);
      const bestScore = appState.levelHighScores[String(lvl.id)] || 0;
      const bestTime = appState.levelBestTimes[String(lvl.id)] || null;

      const card = document.createElement('div');
      card.className = `tr-level-card ${isUnlocked ? '' : 'locked'} ${isCompleted ? 'completed' : ''}`;
      card.setAttribute('role', 'button');
      card.setAttribute('tabindex', isUnlocked ? '0' : '-1');

      card.innerHTML = `
        <div class="tr-lvl-info">
          <span class="tr-lvl-num">SECTOR ${String(lvl.id).padStart(2, '0')}</span>
          <span class="tr-lvl-name">${lvl.name}</span>
          <span class="tr-lvl-meta">${bestScore ? `BEST: ${bestScore} pts · ${bestTime}s` : lvl.difficulty}</span>
        </div>
        <div class="tr-lvl-status ${isCompleted ? 'st-done' : (isUnlocked ? 'st-avail' : 'st-locked')}">
          ${isCompleted ? 'RESTORED' : (isUnlocked ? 'READY' : 'LOCKED')}
        </div>
      `;

      if (isUnlocked) {
        card.addEventListener('click', () => {
          openSectorBriefing(idx);
        });
      }

      levelsGridEl.appendChild(card);
    });
  }

  function openSectorBriefing(lvlIdx) {
    activeLevelIndex = lvlIdx;
    const def = LEVELS_DATA[lvlIdx];
    if (!def) return;

    const sectorNumEl = document.getElementById('tr-boot-sector-num');
    const titleEl = document.getElementById('tr-boot-title');
    const subtitleEl = document.getElementById('tr-boot-subtitle');
    const hazardsEl = document.getElementById('tr-boot-hazards');
    const objEl = document.getElementById('tr-boot-objective');

    if (sectorNumEl) sectorNumEl.textContent = `SECTOR ${String(def.id).padStart(2, '0')} // DEPLOYMENT BRIEFING`;
    if (titleEl) titleEl.textContent = def.name;
    if (subtitleEl) subtitleEl.textContent = def.subtitle;
    if (hazardsEl) hazardsEl.textContent = def.hazards;
    if (objEl) objEl.textContent = def.objective;

    gameState = 'boot';
    showScreen('boot');
  }

  function deploySector() {
    lives = 3;
    score = 0;
    bitsCount = 0;
    checkpointSaved = false;
    activeCheckpointPos = null;

    initLevel(activeLevelIndex, false);
    gameState = 'playing';
    showScreen(null); // Hide all overlay screens for active canvas gameplay
  }

  function toggleAudio() {
    sfxEnabled = !sfxEnabled;
    appState.audioEnabled = sfxEnabled;
    if (audioStateEl) {
      audioStateEl.textContent = sfxEnabled ? 'ON' : 'OFF';
      audioStateEl.style.color = sfxEnabled ? 'var(--tr-lime)' : 'var(--tr-muted)';
    }
    saveAppState();
    if (sfxEnabled) Sound.checkpoint();
  }

  // ─────────────────────────────────────────────────────────────────────────
  // INPUT HANDLERS & TOUCH GAMEPAD
  // ─────────────────────────────────────────────────────────────────────────
  function handleKeyDown(e) {
    if (!isModalOpen) return;

    if (e.code === 'KeyP') {
      if (gameState === 'playing') {
        gameState = 'paused';
        showScreen('pause');
        populatePauseStats();
      } else if (gameState === 'paused') {
        gameState = 'playing';
        showScreen(null);
      }
      return;
    }

    if (e.code === 'Escape') {
      if (gameState === 'playing') {
        gameState = 'paused';
        showScreen('pause');
        populatePauseStats();
        e.preventDefault();
      }
      return;
    }

    if (['KeyA', 'ArrowLeft'].includes(e.code)) {
      keys.left = true;
      e.preventDefault();
    } else if (['KeyD', 'ArrowRight'].includes(e.code)) {
      keys.right = true;
      e.preventDefault();
    } else if (['Space', 'KeyW', 'ArrowUp'].includes(e.code)) {
      keys.jump = true;
      player.jumpBufferTimer = 6;
      e.preventDefault();
    } else if (['KeyE'].includes(e.code)) {
      keys.action = true;
      e.preventDefault();
    }
  }

  function handleKeyUp(e) {
    if (!isModalOpen) return;

    if (['KeyA', 'ArrowLeft'].includes(e.code)) {
      keys.left = false;
    } else if (['KeyD', 'ArrowRight'].includes(e.code)) {
      keys.right = false;
    } else if (['Space', 'KeyW', 'ArrowUp'].includes(e.code)) {
      keys.jump = false;
    } else if (['KeyE'].includes(e.code)) {
      keys.action = false;
    }
  }

  function populatePauseStats() {
    const def = LEVELS_DATA[activeLevelIndex];
    const pauseLevelEl = document.getElementById('tr-pause-level');
    const pauseScoreEl = document.getElementById('tr-pause-score');
    const pauseBitsEl = document.getElementById('tr-pause-bits');
    const pauseTokensEl = document.getElementById('tr-pause-tokens');

    if (pauseLevelEl && def) pauseLevelEl.textContent = `${String(def.id).padStart(2, '0')} // ${def.name}`;
    if (pauseScoreEl) pauseScoreEl.textContent = String(score).padStart(5, '0');
    if (pauseBitsEl) pauseBitsEl.textContent = String(bitsCount);

    const tokensArr = appState.tokensCollected[String(activeLevelIndex + 1)] || [];
    if (pauseTokensEl) pauseTokensEl.textContent = `${tokensArr.length} / 3`;
  }

  function bindTouchButton(btn, onPress, onRelease) {
    if (!btn) return;
    let isPressed = false;

    const startPress = (e) => {
      if (e) {
        if (e.cancelable) e.preventDefault();
        e.stopPropagation();
      }
      if (isPressed) return;
      isPressed = true;
      btn.classList.add('active');
      onPress();
    };

    const endPress = (e) => {
      if (e) {
        if (e.cancelable) e.preventDefault();
        e.stopPropagation();
      }
      if (!isPressed) return;
      isPressed = false;
      btn.classList.remove('active');
      onRelease();
    };

    btn.addEventListener('pointerdown', startPress, { passive: false });
    btn.addEventListener('pointerup', endPress, { passive: false });
    btn.addEventListener('pointercancel', endPress, { passive: false });
    btn.addEventListener('pointerleave', endPress, { passive: false });

    btn.addEventListener('touchstart', startPress, { passive: false });
    btn.addEventListener('touchend', endPress, { passive: false });
    btn.addEventListener('touchcancel', endPress, { passive: false });
  }

  function setupTouchControls() {
    bindTouchButton(btnLeft, () => { keys.left = true; }, () => { keys.left = false; });
    bindTouchButton(btnRight, () => { keys.right = true; }, () => { keys.right = false; });
    bindTouchButton(btnJump, () => { keys.jump = true; player.jumpBufferTimer = 6; }, () => { keys.jump = false; });
    bindTouchButton(btnAction, () => { keys.action = true; }, () => { keys.action = false; });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // MOBILE LANDSCAPE ORIENTATION & ROTATION MANAGERS
  // ─────────────────────────────────────────────────────────────────────────
  function isMobileOrTouch() {
    return window.innerWidth < 860 || ('ontouchstart' in window) || (navigator.maxTouchPoints && navigator.maxTouchPoints > 0);
  }

  function checkOrientationPrompt() {
    if (!isModalOpen) return;
    const isMobile = isMobileOrTouch();
    const isPortrait = window.innerHeight > window.innerWidth;

    if (!isMobile) {
      if (rotatePromptEl) rotatePromptEl.hidden = true;
      return;
    }

    if (!isPortrait) {
      // Hardware / browser already in landscape
      if (isForcedLandscape) {
        toggleForcedLandscape(false);
      }
      if (rotatePromptEl) rotatePromptEl.hidden = true;
      return;
    }

    // Hardware in portrait orientation
    if (isForcedLandscape) {
      if (rotatePromptEl) rotatePromptEl.hidden = true;
    } else if (!rotatePromptDismissed) {
      if (rotatePromptEl) rotatePromptEl.hidden = false;
    }
  }

  async function attemptLandscapeLock() {
    try {
      const docEl = document.documentElement;
      if (!document.fullscreenElement) {
        if (docEl.requestFullscreen) {
          await docEl.requestFullscreen();
        } else if (docEl.webkitRequestFullscreen) {
          await docEl.webkitRequestFullscreen();
        }
      }
      if (screen.orientation && screen.orientation.lock) {
        await screen.orientation.lock('landscape');
      }
    } catch (_) {
      // Screen orientation lock not permitted or unsupported (e.g. iOS Safari)
      toggleForcedLandscape(true);
    }
    if (rotatePromptEl) rotatePromptEl.hidden = true;
    rotatePromptDismissed = true;
    setTimeout(resizeCanvas, 60);
  }

  function toggleForcedLandscape(forceState) {
    if (typeof forceState === 'boolean') {
      isForcedLandscape = forceState;
    } else {
      isForcedLandscape = !isForcedLandscape;
    }

    if (overlay) {
      overlay.classList.toggle('tr-forced-landscape', isForcedLandscape);
    }
    if (rotateToggleBtn) {
      rotateToggleBtn.classList.toggle('active', isForcedLandscape);
    }
    if (rotatePromptEl) {
      rotatePromptEl.hidden = true;
    }
    rotatePromptDismissed = true;

    setTimeout(resizeCanvas, 50);
    setTimeout(resizeCanvas, 200);
  }

  function dismissRotatePrompt() {
    rotatePromptDismissed = true;
    if (rotatePromptEl) rotatePromptEl.hidden = true;
    resizeCanvas();
  }

  let physicsAccumulator = 0;
  const FIXED_STEP = 1 / 60;

  function openRunnerModal() {
    if (isModalOpen) return;
    isModalOpen = true;

    overlay.hidden = false;
    document.body.classList.add('fe-modal-open', 'game-active');
    document.body.style.overflow = 'hidden';

    if (window.__pauseContourBackground) {
      window.__pauseContourBackground();
    }

    loadSavedState();
    sfxEnabled = appState.audioEnabled || false;
    if (audioStateEl) {
      audioStateEl.textContent = sfxEnabled ? 'ON' : 'OFF';
      audioStateEl.style.color = sfxEnabled ? 'var(--tr-lime)' : 'var(--tr-muted)';
    }

    updateMenuStats();
    gameState = 'menu';
    showScreen('menu');

    checkOrientationPrompt();

    requestAnimationFrame(() => {
      overlay.classList.add('open');
      resizeCanvas();
    });

    physicsAccumulator = 0;
    lastTime = performance.now();
    if (rafId === null) {
      rafId = requestAnimationFrame(mainLoop);
    }
  }

  function closeRunnerModal() {
    if (!isModalOpen) return;
    isModalOpen = false;

    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }

    if (isForcedLandscape) {
      toggleForcedLandscape(false);
    }
    if (rotatePromptEl) {
      rotatePromptEl.hidden = true;
    }
    rotatePromptDismissed = false;

    if (document.fullscreenElement && document.exitFullscreen) {
      document.exitFullscreen().catch(() => {});
    }

    overlay.classList.remove('open');
    document.body.classList.remove('fe-modal-open', 'game-active');
    document.body.style.overflow = '';

    if (window.__resumeContourBackground) {
      window.__resumeContourBackground();
    }

    setTimeout(() => {
      if (!isModalOpen) {
        overlay.hidden = true;
        if (openBtn) openBtn.focus();
      }
    }, 280);
  }

  function resizeCanvas() {
    if (!canvas || !stage) return;
    const rect = stage.getBoundingClientRect();

    let displayW = stage.clientWidth || rect.width || V_WIDTH;
    let displayH = stage.clientHeight || rect.height || V_HEIGHT;

    if (isForcedLandscape && (!stage.clientWidth || stage.clientWidth < 100)) {
      displayW = rect.height || V_WIDTH;
      displayH = rect.width || V_HEIGHT;
    }

    const isMobileDevice = window.innerWidth < 768 || ('ontouchstart' in window);
    const maxDpr = isMobileDevice ? 1.0 : 1.5;
    const dpr = Math.min(window.devicePixelRatio || 1, maxDpr);

    canvas.width = Math.floor(displayW * dpr);
    canvas.height = Math.floor(displayH * dpr);
    if (ctx) {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(canvas.width / V_WIDTH, canvas.height / V_HEIGHT);
    }
  }

  function mainLoop(now) {
    if (!isModalOpen) return;

    const rawDt = (now - lastTime) / 1000;
    lastTime = now;
    const dt = Math.min(rawDt, 0.1);
    physicsAccumulator += dt;

    let updates = 0;
    while (physicsAccumulator >= FIXED_STEP && updates < 4) {
      update(FIXED_STEP);
      physicsAccumulator -= FIXED_STEP;
      updates++;
    }

    render();

    rafId = requestAnimationFrame(mainLoop);
  }

  document.addEventListener('visibilitychange', () => {
    if (!isModalOpen) return;
    if (document.hidden) {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
    } else {
      if (rafId === null) {
        lastTime = performance.now();
        physicsAccumulator = 0;
        rafId = requestAnimationFrame(mainLoop);
      }
    }
  });

  // ─────────────────────────────────────────────────────────────────────────
  // INITIALIZATION ON DOM CONTENT LOADED
  // ─────────────────────────────────────────────────────────────────────────
  function initDOM() {
    overlay = document.getElementById('tr-overlay');
    stage = document.getElementById('tr-stage');
    canvas = document.getElementById('tr-canvas');
    if (!overlay || !stage || !canvas) return;

    ctx = canvas.getContext('2d');

    // Header Telemetry & Buttons
    statusTextEl = document.getElementById('tr-status-text');
    topLevelEl = document.getElementById('tr-top-level');
    topScoreEl = document.getElementById('tr-top-score');
    topBitsEl = document.getElementById('tr-top-bits');
    topLivesEl = document.getElementById('tr-top-lives');
    audioToggleBtn = document.getElementById('tr-audio-toggle');
    audioStateEl = document.getElementById('tr-audio-state');
    openLevelsBtn = document.getElementById('tr-open-levels-btn');
    exitTopBtn = document.getElementById('tr-exit-top-btn');

    // Screens
    screenMenu = document.getElementById('tr-screen-menu');
    screenBoot = document.getElementById('tr-screen-boot');
    screenLevels = document.getElementById('tr-screen-levels');
    screenPause = document.getElementById('tr-screen-pause');
    screenGameover = document.getElementById('tr-screen-gameover');
    screenVictory = document.getElementById('tr-screen-victory');
    screenGrandVictory = document.getElementById('tr-screen-grand-victory');
    levelsGridEl = document.getElementById('tr-levels-grid');

    // Touch controls
    touchControlsEl = document.getElementById('tr-touch-controls');
    btnLeft = document.getElementById('tr-btn-left');
    btnRight = document.getElementById('tr-btn-right');
    btnJump = document.getElementById('tr-btn-jump');
    btnAction = document.getElementById('tr-btn-action');

    // Rotation & Landscape elements
    rotatePromptEl = document.getElementById('tr-rotate-prompt');
    rotateToggleBtn = document.getElementById('tr-rotate-toggle-btn');
    rotateLockBtn = document.getElementById('tr-rotate-lock-btn');
    rotateForceBtn = document.getElementById('tr-rotate-force-btn');
    rotateDismissBtn = document.getElementById('tr-rotate-dismiss-btn');

    if (rotateToggleBtn) {
      rotateToggleBtn.addEventListener('click', () => toggleForcedLandscape());
    }
    if (rotateLockBtn) {
      rotateLockBtn.addEventListener('click', attemptLandscapeLock);
    }
    if (rotateForceBtn) {
      rotateForceBtn.addEventListener('click', () => toggleForcedLandscape(true));
    }
    if (rotateDismissBtn) {
      rotateDismissBtn.addEventListener('click', dismissRotatePrompt);
    }

    // Launch button in carousel
    openBtn = document.getElementById('open-runner-btn');

    // Setup event listeners
    if (openBtn) openBtn.addEventListener('click', openRunnerModal);
    if (exitTopBtn) exitTopBtn.addEventListener('click', closeRunnerModal);
    if (audioToggleBtn) audioToggleBtn.addEventListener('click', toggleAudio);

    if (openLevelsBtn) {
      openLevelsBtn.addEventListener('click', () => {
        gameState = 'levels';
        showScreen('levels');
      });
    }

    // Main Menu Buttons
    const menuStartBtn = document.getElementById('tr-start-btn');
    const menuLevelsBtn = document.getElementById('tr-menu-levels-btn');
    const menuExitBtn = document.getElementById('tr-menu-exit-btn');
    if (menuStartBtn) menuStartBtn.addEventListener('click', () => openSectorBriefing(0));
    if (menuLevelsBtn) menuLevelsBtn.addEventListener('click', () => {
      gameState = 'levels';
      showScreen('levels');
    });
    if (menuExitBtn) menuExitBtn.addEventListener('click', closeRunnerModal);

    // Boot Briefing Buttons
    const bootDeployBtn = document.getElementById('tr-boot-deploy-btn');
    const bootBackBtn = document.getElementById('tr-boot-back-btn');
    if (bootDeployBtn) bootDeployBtn.addEventListener('click', deploySector);
    if (bootBackBtn) bootBackBtn.addEventListener('click', () => {
      gameState = 'levels';
      showScreen('levels');
    });

    // Level Select Close
    const levelsCloseBtn = document.getElementById('tr-levels-close-btn');
    if (levelsCloseBtn) levelsCloseBtn.addEventListener('click', () => {
      gameState = 'menu';
      showScreen('menu');
    });

    // Pause Screen Buttons
    const resumeBtn = document.getElementById('tr-resume-btn');
    const pauseRestartBtn = document.getElementById('tr-pause-restart-btn');
    const pauseLevelsBtn = document.getElementById('tr-pause-levels-btn');
    const pauseExitBtn = document.getElementById('tr-pause-exit-btn');
    if (resumeBtn) resumeBtn.addEventListener('click', () => {
      gameState = 'playing';
      showScreen(null);
    });
    if (pauseRestartBtn) pauseRestartBtn.addEventListener('click', deploySector);
    if (pauseLevelsBtn) pauseLevelsBtn.addEventListener('click', () => {
      gameState = 'levels';
      showScreen('levels');
    });
    if (pauseExitBtn) pauseExitBtn.addEventListener('click', closeRunnerModal);

    // Game Over Buttons
    const retryBtn = document.getElementById('tr-retry-btn');
    const failLevelsBtn = document.getElementById('tr-fail-levels-btn');
    const failExitBtn = document.getElementById('tr-fail-exit-btn');
    if (retryBtn) retryBtn.addEventListener('click', deploySector);
    if (failLevelsBtn) failLevelsBtn.addEventListener('click', () => {
      gameState = 'levels';
      showScreen('levels');
    });
    if (failExitBtn) failExitBtn.addEventListener('click', closeRunnerModal);

    // Sector Victory Buttons
    const vicNextBtn = document.getElementById('tr-vic-next-btn');
    const vicReplayBtn = document.getElementById('tr-vic-replay-btn');
    const vicLevelsBtn = document.getElementById('tr-vic-levels-btn');
    if (vicNextBtn) {
      vicNextBtn.addEventListener('click', () => {
        if (activeLevelIndex < 9) {
          openSectorBriefing(activeLevelIndex + 1);
        } else {
          gameState = 'grand_victory';
          showScreen('grand_victory');
        }
      });
    }
    if (vicReplayBtn) vicReplayBtn.addEventListener('click', deploySector);
    if (vicLevelsBtn) vicLevelsBtn.addEventListener('click', () => {
      gameState = 'levels';
      showScreen('levels');
    });

    // Grand Victory Buttons
    const grandReplayBtn = document.getElementById('tr-grand-replay-btn');
    const grandLevelsBtn = document.getElementById('tr-grand-levels-btn');
    const grandExitBtn = document.getElementById('tr-grand-exit-btn');
    if (grandReplayBtn) grandReplayBtn.addEventListener('click', () => openSectorBriefing(0));
    if (grandLevelsBtn) grandLevelsBtn.addEventListener('click', () => {
      gameState = 'levels';
      showScreen('levels');
    });
    if (grandExitBtn) grandExitBtn.addEventListener('click', closeRunnerModal);

    // Global Key, Resize and Orientation Listeners
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('resize', () => {
      resizeCanvas();
      checkOrientationPrompt();
    });
    window.addEventListener('orientationchange', () => {
      setTimeout(() => {
        resizeCanvas();
        checkOrientationPrompt();
      }, 100);
    });

    setupTouchControls();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDOM);
  } else {
    initDOM();
  }
})();
