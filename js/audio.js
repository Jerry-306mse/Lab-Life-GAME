
/* Lab Life — tiny generative soundtrack + pixel SFX. No external audio files. */
(function () {
  'use strict';

  const SETTINGS_KEY = 'lablife_settings_v1';
  const A = {
    ctx: null,
    master: null,
    musicGain: null,
    sfxGain: null,
    musicOn: true,
    sfxOn: true,
    started: false,
    timer: null,
    nextNote: 0,
    step: 0,
    chord: 0,
    noiseBuffer: null
  };

  const CHORDS = [
    { root: 50, notes: [62, 65, 69, 72] }, // Dm7-ish
    { root: 46, notes: [58, 62, 65, 69] }, // Bbmaj7
    { root: 41, notes: [53, 57, 60, 64] }, // Fmaj7
    { root: 48, notes: [55, 60, 64, 67] }  // C
  ];

  function loadSettings() {
    try {
      const s = JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}');
      if (typeof s.musicOn === 'boolean') A.musicOn = s.musicOn;
      if (typeof s.sfxOn === 'boolean') A.sfxOn = s.sfxOn;
    } catch (e) { /* ignore */ }
  }

  function saveSettings() {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify({ musicOn: A.musicOn, sfxOn: A.sfxOn }));
    } catch (e) { /* ignore */ }
  }

  function midi(n) {
    return 440 * Math.pow(2, (n - 69) / 12);
  }

  A.init = function () {
    if (A.ctx) return A.ctx;
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return null;
    A.ctx = new Ctx();
    A.master = A.ctx.createGain();
    A.master.gain.value = 0.55;
    A.master.connect(A.ctx.destination);
    A.musicGain = A.ctx.createGain();
    A.musicGain.gain.value = A.musicOn ? 0.12 : 0;
    A.musicGain.connect(A.master);
    A.sfxGain = A.ctx.createGain();
    A.sfxGain.gain.value = A.sfxOn ? 0.32 : 0;
    A.sfxGain.connect(A.master);
    A.noiseBuffer = makeNoise();
    return A.ctx;
  };

  function makeNoise() {
    const len = A.ctx.sampleRate * 2;
    const buf = A.ctx.createBuffer(1, len, A.ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    return buf;
  }

  A.resume = function () {
    A.init();
    if (!A.ctx) return;
    if (A.ctx.state === 'suspended') A.ctx.resume();
    if (!A.started) {
      A.started = true;
      startMusic();
    }
  };

  function startMusic() {
    if (!A.ctx) return;
    A.nextNote = A.ctx.currentTime + 0.15;
    if (A.timer) clearInterval(A.timer);
    A.timer = setInterval(schedule, 90);
  }

  function schedule() {
    if (!A.ctx || !A.musicOn) return;
    const bpm = 74;
    const eighth = 60 / bpm / 2;
    while (A.nextNote < A.ctx.currentTime + 0.5) {
      playStep(A.step, A.nextNote, eighth);
      A.step++;
      A.nextNote += eighth;
    }
  }

  function playStep(step, time, eighth) {
    const bar = Math.floor(step / 8) % 4;
    const pos = step % 8;
    const ch = CHORDS[bar];
    if (pos === 0) {
      playPad(ch.notes, time, eighth * 8);
      playBass(ch.root, time, eighth * 4);
    }
    if (pos === 4) {
      playBass(ch.root + 7, time, eighth * 2);
    }
    // sparse arpeggio
    if (pos === 1 || pos === 3 || pos === 6) {
      const n = ch.notes[(pos + bar) % ch.notes.length] + 12;
      playPluck(n, time, eighth * 0.9, 0.045);
    }
    if (pos === 7 && (bar === 1 || bar === 3)) {
      playPluck(ch.notes[2] + 24, time, eighth * 1.6, 0.025);
    }
    // soft rain / room tone
    if (pos === 0) playNoise(time, eighth * 8, 0.006);
  }

  function playPad(notes, time, dur) {
    const g = A.ctx.createGain();
    g.gain.setValueAtTime(0, time);
    g.gain.linearRampToValueAtTime(0.045, time + 0.5);
    g.gain.linearRampToValueAtTime(0.0001, time + dur);
    g.connect(A.musicGain);
    notes.forEach((n, i) => {
      const o = A.ctx.createOscillator();
      o.type = 'triangle';
      o.frequency.value = midi(n);
      o.detune.value = (i - 1.5) * 3;
      o.connect(g);
      o.start(time);
      o.stop(time + dur + 0.1);
    });
  }

  function playBass(n, time, dur) {
    const o = A.ctx.createOscillator();
    const g = A.ctx.createGain();
    o.type = 'sine';
    o.frequency.value = midi(n);
    g.gain.setValueAtTime(0.0001, time);
    g.gain.exponentialRampToValueAtTime(0.08, time + 0.04);
    g.gain.exponentialRampToValueAtTime(0.0001, time + dur);
    o.connect(g);
    g.connect(A.musicGain);
    o.start(time);
    o.stop(time + dur + 0.05);
  }

  function playPluck(n, time, dur, vol) {
    const o = A.ctx.createOscillator();
    const g = A.ctx.createGain();
    o.type = 'square';
    o.frequency.value = midi(n);
    g.gain.setValueAtTime(0.0001, time);
    g.gain.exponentialRampToValueAtTime(vol, time + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, time + dur);
    o.connect(g);
    g.connect(A.musicGain);
    o.start(time);
    o.stop(time + dur + 0.02);
  }

  function playNoise(time, dur, vol) {
    const src = A.ctx.createBufferSource();
    const g = A.ctx.createGain();
    const f = A.ctx.createBiquadFilter();
    src.buffer = A.noiseBuffer;
    src.loop = true;
    f.type = 'lowpass';
    f.frequency.value = 900;
    g.gain.setValueAtTime(0, time);
    g.gain.linearRampToValueAtTime(vol, time + 0.8);
    g.gain.linearRampToValueAtTime(0, time + dur);
    src.connect(f);
    f.connect(g);
    g.connect(A.musicGain);
    src.start(time);
    src.stop(time + dur + 0.1);
  }

  /* ------------- SFX ------------- */

  function tone(freq, dur, type, vol, slideTo) {
    if (!A.ctx || !A.sfxOn) return;
    const t = A.ctx.currentTime;
    const o = A.ctx.createOscillator();
    const g = A.ctx.createGain();
    o.type = type || 'square';
    o.frequency.setValueAtTime(freq, t);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol || 0.08, t + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g);
    g.connect(A.sfxGain);
    o.start(t);
    o.stop(t + dur + 0.02);
  }

  function noiseHit(dur, vol, filterFreq) {
    if (!A.ctx || !A.sfxOn || !A.noiseBuffer) return;
    const t = A.ctx.currentTime;
    const src = A.ctx.createBufferSource();
    const g = A.ctx.createGain();
    const f = A.ctx.createBiquadFilter();
    src.buffer = A.noiseBuffer;
    f.type = 'bandpass';
    f.frequency.value = filterFreq || 1200;
    f.Q.value = 1.2;
    g.gain.setValueAtTime(vol || 0.06, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(f);
    f.connect(g);
    g.connect(A.sfxGain);
    src.start(t);
    src.stop(t + dur + 0.02);
  }

  const SFX = {
    click() { tone(420, 0.045, 'square', 0.045, 320); },
    hover() { tone(620, 0.025, 'square', 0.018); },
    page() { noiseHit(0.08, 0.035, 2400); },
    success() {
      tone(523, 0.1, 'square', 0.05);
      setTimeout(() => tone(659, 0.1, 'square', 0.05), 70);
      setTimeout(() => tone(784, 0.18, 'square', 0.05), 140);
    },
    great() {
      tone(523, 0.12, 'square', 0.055);
      setTimeout(() => tone(784, 0.12, 'square', 0.055), 80);
      setTimeout(() => tone(1046, 0.26, 'triangle', 0.065), 160);
    },
    warn() {
      tone(220, 0.16, 'sawtooth', 0.045);
      setTimeout(() => tone(180, 0.2, 'sawtooth', 0.04), 130);
    },
    bad() {
      tone(160, 0.22, 'sawtooth', 0.06);
      setTimeout(() => tone(120, 0.35, 'sawtooth', 0.05), 160);
    },
    coin() {
      tone(880, 0.07, 'square', 0.05);
      setTimeout(() => tone(1320, 0.15, 'square', 0.045), 60);
    },
    paper() {
      noiseHit(0.14, 0.04, 1800);
      setTimeout(() => tone(540, 0.08, 'triangle', 0.04), 60);
    },
    open() { tone(300, 0.05, 'square', 0.035, 460); },
    close() { tone(460, 0.05, 'square', 0.035, 300); },
    week() {
      tone(392, 0.1, 'triangle', 0.04);
      setTimeout(() => tone(523, 0.14, 'triangle', 0.045), 100);
    }
  };

  A.play = function (name) {
    if (!A.ctx) return;
    const fn = SFX[name];
    if (fn) {
      try { fn(); } catch (e) { /* ignore */ }
    }
  };

  A.toggleMusic = function (force) {
    A.musicOn = typeof force === 'boolean' ? force : !A.musicOn;
    if (A.musicGain) A.musicGain.gain.setTargetAtTime(A.musicOn ? 0.12 : 0, A.ctx.currentTime, 0.08);
    if (A.musicOn) {
      if (!A.started) A.resume();
      else if (A.ctx && A.ctx.state === 'suspended') A.ctx.resume();
    }
    saveSettings();
    return A.musicOn;
  };

  A.toggleSfx = function (force) {
    A.sfxOn = typeof force === 'boolean' ? force : !A.sfxOn;
    if (A.sfxGain) A.sfxGain.gain.setTargetAtTime(A.sfxOn ? 0.32 : 0, A.ctx.currentTime, 0.05);
    saveSettings();
    return A.sfxOn;
  };

  A.setMusicOn = function (on) { A.musicOn = !!on; saveSettings(); };
  A.setSfxOn = function (on) { A.sfxOn = !!on; saveSettings(); };
  A.isMusicOn = () => A.musicOn;
  A.isSfxOn = () => A.sfxOn;

  loadSettings();
  window.LabAudio = A;
})();

