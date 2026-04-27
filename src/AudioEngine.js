class AudioEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.bgmNodes = []; // Support multiple oscillators for "thick" sound
    this.initialized = false;
    this.isPlaying = false;
  }

  init() {
    if (this.initialized) return;
    this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = 0.4;
    this.masterGain.connect(this.ctx.destination);
    this.initialized = true;
  }

  resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Dramatic Procedural BGM
  startBGM(mode) {
    if (!this.initialized) this.init();
    this.stopBGM();
    
    const now = this.ctx.currentTime;
    const bgmGain = this.ctx.createGain();
    bgmGain.gain.value = 0.08; 

    // Create 3 detuned oscillators for a dramatic "supersaw" or thick pad effect
    const createOsc = (freq, type, detune = 0) => {
      const osc = this.ctx.createOscillator();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, now);
      osc.detune.setValueAtTime(detune, now);
      osc.connect(bgmGain);
      osc.start();
      return osc;
    };

    switch(mode) {
      case 'RAIN': 
        // Eerie Dark Ambient: Deep low drone
        this.bgmNodes.push(createOsc(55, 'sine'));
        this.bgmNodes.push(createOsc(55.5, 'triangle', 10));
        this.addLFO(bgmGain.gain, 0.5, 0.03); // Slow deep pulse
        break;

      case 'HACKER': 
        // Industrial Tech: Aggressive square pulse
        this.bgmNodes.push(createOsc(40, 'square'));
        this.bgmNodes.push(createOsc(40.2, 'square', 15));
        this.addLFO(bgmGain.gain, 4, 0.05); // Fast tense pulse
        break;

      case 'HIGHWAY': 
        // High-Energy Synthwave: Epic driving bass
        this.bgmNodes.push(createOsc(80, 'sawtooth'));
        this.bgmNodes.push(createOsc(80.5, 'sawtooth', 20));
        this.bgmNodes.push(createOsc(160, 'sawtooth', -10));
        this.addLFO(bgmGain.gain, 8, 0.04); // Rapid drive
        break;

      case 'SAMURAI': 
        // Cinematic Tension: Low brassy triangle with high whistle
        this.bgmNodes.push(createOsc(45, 'sawtooth'));
        this.bgmNodes.push(createOsc(45.5, 'triangle', 15));
        this.bgmNodes.push(createOsc(440, 'sine', 5)); // Eerie high note
        this.addLFO(bgmGain.gain, 1.5, 0.06); // Unsteady tension
        break;
    }

    bgmGain.connect(this.masterGain);
    this.isPlaying = true;
  }

  addLFO(target, rate, depth) {
    const lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();
    lfo.frequency.value = rate;
    lfoGain.gain.value = depth;
    lfo.connect(lfoGain);
    lfoGain.connect(target);
    lfo.start();
    this.bgmNodes.push(lfo); // Track LFOs so we can stop them
  }

  stopBGM() {
    this.bgmNodes.forEach(node => {
      try { node.stop(); } catch(e) {}
      node.disconnect();
    });
    this.bgmNodes = [];
    this.isPlaying = false;
  }

  // Improved Dramatic Hit Sounds
  playRainPlink(lane) {
    if (!this.initialized) this.init();
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const freqs = [220, 277.18, 329.63, 415.30]; // Minor 7th chord (A, C#, E, G#)
    osc.frequency.setValueAtTime(freqs[lane] || 220, now);
    osc.type = 'sine';
    gain.gain.setValueAtTime(0.5, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start();
    osc.stop(now + 0.3);
  }

  playSynthBeep(note = 0) {
    if (!this.initialized) this.init();
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.frequency.setValueAtTime(110 * Math.pow(2, note / 12), now);
    osc.type = 'sawtooth';
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start();
    osc.stop(now + 0.15);
  }

  playHitSound() {
    if (!this.initialized) this.init();
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const noise = this.ctx.createBufferSource();
    const gain = this.ctx.createGain();
    
    // Impact sound: low thud + short triangle
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.1);
    osc.type = 'triangle';
    
    gain.gain.setValueAtTime(0.6, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
    
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start();
    osc.stop(now + 0.2);
  }

  setVolume(val) {
    if (this.masterGain) this.masterGain.gain.value = val;
  }
}

const audioEngine = new AudioEngine();
export default audioEngine;