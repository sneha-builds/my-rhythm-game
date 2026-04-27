class AudioEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.bgmNodes = []; 
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

  startBGM(mode) {
    if (!this.initialized) this.init();
    this.stopBGM();
    const now = this.ctx.currentTime;
    const bgmGain = this.ctx.createGain();
    bgmGain.gain.value = 0.08; 

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
        this.bgmNodes.push(createOsc(55, 'sine'));
        this.bgmNodes.push(createOsc(55.5, 'triangle', 10));
        this.addLFO(bgmGain.gain, 0.5, 0.03); 
        break;
      case 'HACKER': 
        this.bgmNodes.push(createOsc(40, 'square'));
        this.bgmNodes.push(createOsc(40.2, 'square', 15));
        this.addLFO(bgmGain.gain, 4, 0.05); 
        break;
      case 'HIGHWAY': 
        this.bgmNodes.push(createOsc(80, 'sawtooth'));
        this.bgmNodes.push(createOsc(80.5, 'sawtooth', 20));
        this.bgmNodes.push(createOsc(160, 'sawtooth', -10));
        this.addLFO(bgmGain.gain, 8, 0.04); 
        break;
      case 'SAMURAI': 
        this.bgmNodes.push(createOsc(45, 'sawtooth'));
        this.bgmNodes.push(createOsc(45.5, 'triangle', 15));
        this.bgmNodes.push(createOsc(440, 'sine', 5)); 
        this.addLFO(bgmGain.gain, 1.5, 0.06); 
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
    this.bgmNodes.push(lfo);
  }

  stopBGM() {
    this.bgmNodes.forEach(node => {
      try { node.stop(); } catch(e) {}
      node.disconnect();
    });
    this.bgmNodes = [];
    this.isPlaying = false;
  }

  // --- NEW ENHANCED HIT SOUNDS ---

  // A crystal-clear "Ting" sound for Rain Tiles
  playRainPlink(lane) {
    if (!this.initialized) this.init();
    const now = this.ctx.currentTime;
    const freqs = [523.25, 587.33, 659.25, 698.46]; // High C, D, E, F
    
    // Fundamental tone
    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freqs[lane], now);
    
    // Sharp attack component (the "click")
    const click = this.ctx.createOscillator();
    click.type = 'triangle';
    click.frequency.setValueAtTime(freqs[lane] * 2, now);
    
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.4, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
    
    osc.connect(gain);
    click.connect(gain);
    gain.connect(this.masterGain);
    
    osc.start();
    click.start();
    osc.stop(now + 0.4);
    click.stop(now + 0.1);
  }

  // A clean, digital "Chime" for Hacker/Highway
  playSynthBeep(note = 0) {
    if (!this.initialized) this.init();
    const now = this.ctx.currentTime;
    const freq = 440 * Math.pow(2, note / 12);
    
    const osc = this.ctx.createOscillator();
    osc.type = 'triangle'; // Softer than sawtooth
    osc.frequency.setValueAtTime(freq, now);
    
    const sub = this.ctx.createOscillator();
    sub.type = 'sine';
    sub.frequency.setValueAtTime(freq / 2, now);
    
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
    
    osc.connect(gain);
    sub.connect(gain);
    gain.connect(this.masterGain);
    
    osc.start();
    sub.start();
    osc.stop(now + 0.2);
    sub.stop(now + 0.2);
  }

  // A satisfying "Slash/Impact" for Samurai
  playHitSound() {
    if (!this.initialized) this.init();
    const now = this.ctx.currentTime;
    
    // White noise for the "brush/slash" effect
    const bufferSize = this.ctx.sampleRate * 0.1;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    
    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.2, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
    
    // Low punchy sine sweep
    const punch = this.ctx.createOscillator();
    punch.frequency.setValueAtTime(200, now);
    punch.frequency.exponentialRampToValueAtTime(40, now + 0.1);
    
    const punchGain = this.ctx.createGain();
    punchGain.gain.setValueAtTime(0.5, now);
    punchGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    
    noise.connect(noiseGain);
    noiseGain.connect(this.masterGain);
    punch.connect(punchGain);
    punchGain.connect(this.masterGain);
    
    noise.start();
    punch.start();
    noise.stop(now + 0.1);
    punch.stop(now + 0.15);
  }

  setVolume(val) {
    if (this.masterGain) this.masterGain.gain.value = val;
  }
}

const audioEngine = new AudioEngine();
export default audioEngine;