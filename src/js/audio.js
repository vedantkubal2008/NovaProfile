/**
 * Procedural Web Audio Engine for Loomi the Star-Weaver
 * Pure mathematical synthesis - Zero external mp3 downloads, zero 404 risks!
 */

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.isMuted = true; // Safe default respecting autoplay policies
    this.lullabyInterval = null;
    this.lullabyPlaying = false;
    
    // Pentatonic celestial scale frequencies (C5, D5, E5, G5, A5, C6, D6, E6)
    this.celestialScale = [523.25, 587.33, 659.25, 783.99, 880.00, 1046.50, 1174.66, 1318.51];
    
    // Check saved state
    try {
      const savedMute = localStorage.getItem('loomi_muted');
      if (savedMute !== null) {
        this.isMuted = savedMute === 'true';
      }
    } catch (e) {
      // Ignore localStorage restrictions
    }
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.init();
    this.isMuted = !this.isMuted;
    try {
      localStorage.setItem('loomi_muted', this.isMuted.toString());
    } catch (e) {}

    if (!this.isMuted) {
      this.playChime(659.25, 0.25); // Gentle E5 awakening chime
    } else {
      if (this.lullabyPlaying) {
        this.stopLullaby();
      }
    }
    return this.isMuted;
  }

  // Soft wooden bubble click
  playPop() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(380, t);
    osc.frequency.exponentialRampToValueAtTime(110, t + 0.07);

    gain.gain.setValueAtTime(0.18, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.07);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.08);
  }

  // Resonant celestial music box chime
  playChime(freq = 659.25, volume = 0.2) {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const subOsc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, t);

    // Warm sub-harmonic
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(freq / 2, t);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2400, t);
    filter.frequency.exponentialRampToValueAtTime(800, t + 1.2);

    gain.gain.setValueAtTime(volume, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 1.4);

    osc.connect(filter);
    subOsc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    subOsc.start(t);
    osc.stop(t + 1.4);
    subOsc.stop(t + 1.4);
  }

  // Pentatonic star-weaving harp
  playHarp(step = 0) {
    const freq = this.celestialScale[Math.abs(step) % this.celestialScale.length];
    this.playChime(freq, 0.22);
  }

  // Quick sparkly twinkle
  playTwinkle() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const notes = [783.99, 1046.50, 1318.51];
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.playChime(freq, 0.12);
      }, idx * 60);
    });
  }

  // Procedural Cute Baby Astronaut Giggle / Laugh
  playBabyGiggle() {
    if (this.isMuted) {
      // Auto unmute briefly to share the joy if clicked
      this.toggleMute();
    }
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    // Baby giggle pitch sequence ("he-he-he-hee!")
    const bursts = [
      { startFreq: 700, endFreq: 860, delay: 0.00, duration: 0.09, vol: 0.22 },
      { startFreq: 780, endFreq: 940, delay: 0.11, duration: 0.09, vol: 0.25 },
      { startFreq: 880, endFreq: 1080, delay: 0.22, duration: 0.11, vol: 0.28 },
      { startFreq: 960, endFreq: 820, delay: 0.35, duration: 0.16, vol: 0.20 }
    ];

    bursts.forEach(({ startFreq, endFreq, delay, duration, vol }) => {
      const burstTime = t + delay;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const formant = this.ctx.createBiquadFilter();

      // Vocal baby formant filter
      formant.type = 'bandpass';
      formant.frequency.setValueAtTime(2100, burstTime);
      formant.Q.setValueAtTime(2.5, burstTime);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(startFreq, burstTime);
      osc.frequency.exponentialRampToValueAtTime(endFreq, burstTime + duration);

      // Cute giggle envelope
      gain.gain.setValueAtTime(0.001, burstTime);
      gain.gain.linearRampToValueAtTime(vol, burstTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, burstTime + duration);

      osc.connect(formant);
      formant.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(burstTime);
      osc.stop(burstTime + duration + 0.02);
    });
  }

  // Music Box Lullaby: "Twinkle, Twinkle, Little Star"
  toggleLullaby() {
    if (this.lullabyPlaying) {
      this.stopLullaby();
      return false;
    } else {
      if (this.isMuted) {
        this.toggleMute();
      }
      this.startLullaby();
      return true;
    }
  }

  startLullaby() {
    this.init();
    this.lullabyPlaying = true;

    // "Twinkle, Twinkle, Little Star" notes and relative durations
    const C5 = 523.25, D5 = 587.33, E5 = 659.25, F5 = 698.46, G5 = 783.99, A5 = 880.00;
    const melody = [
      // Twin-kle, twin-kle, lit-tle star,
      { freq: C5, beats: 1 }, { freq: C5, beats: 1 },
      { freq: G5, beats: 1 }, { freq: G5, beats: 1 },
      { freq: A5, beats: 1 }, { freq: A5, beats: 1 },
      { freq: G5, beats: 2 },

      // How I won-der what you are!
      { freq: F5, beats: 1 }, { freq: F5, beats: 1 },
      { freq: E5, beats: 1 }, { freq: E5, beats: 1 },
      { freq: D5, beats: 1 }, { freq: D5, beats: 1 },
      { freq: C5, beats: 2 },

      // Up a-bove the world so high,
      { freq: G5, beats: 1 }, { freq: G5, beats: 1 },
      { freq: F5, beats: 1 }, { freq: F5, beats: 1 },
      { freq: E5, beats: 1 }, { freq: E5, beats: 1 },
      { freq: D5, beats: 2 },

      // Like a dia-mond in the sky.
      { freq: G5, beats: 1 }, { freq: G5, beats: 1 },
      { freq: F5, beats: 1 }, { freq: F5, beats: 1 },
      { freq: E5, beats: 1 }, { freq: E5, beats: 1 },
      { freq: D5, beats: 2 },

      // Twin-kle, twin-kle, lit-tle star,
      { freq: C5, beats: 1 }, { freq: C5, beats: 1 },
      { freq: G5, beats: 1 }, { freq: G5, beats: 1 },
      { freq: A5, beats: 1 }, { freq: A5, beats: 1 },
      { freq: G5, beats: 2 },

      // How I won-der what you are!
      { freq: F5, beats: 1 }, { freq: F5, beats: 1 },
      { freq: E5, beats: 1 }, { freq: E5, beats: 1 },
      { freq: D5, beats: 1 }, { freq: D5, beats: 1 },
      { freq: C5, beats: 3 }
    ];

    let noteIndex = 0;
    const beatDuration = 480; // ms per beat

    const playNextNote = () => {
      if (!this.lullabyPlaying || this.isMuted) return;

      const note = melody[noteIndex];
      // Music box chime with sweet celestial sustain
      this.playChime(note.freq, 0.22);

      noteIndex = (noteIndex + 1) % melody.length;
      const delay = note.beats * beatDuration;

      this.lullabyInterval = setTimeout(playNextNote, delay);
    };

    playNextNote();
  }

  stopLullaby() {
    this.lullabyPlaying = false;
    if (this.lullabyInterval) {
      clearTimeout(this.lullabyInterval);
      this.lullabyInterval = null;
    }
  }
}

export const sounds = new SoundEngine();
