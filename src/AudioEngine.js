class AudioEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.bgmNode = null;
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

  // Plays a procedural loop based on the mode
  startBGM(mode) {
    if (!this.initialized) this.init();
    this.stopBGM();
    
    this.bgmNode = this.ctx.createOscillator();
    const bgmGain = this.ctx.createGain();
    bgmGain.gain.value = 0.05; // Low volume for BGM

    let freq = 220;
    let type = 'sine';

    switch(mode) {
      case 'RAIN': 
        freq = 110; type = 'sine'; break;
      case 'HACKER': 
        freq = 80; type = 'square'; break;
      case 'HIGHWAY': 
        freq = 140; type = 'sawtooth'; break;
      case 'SAMURAI': 
        freq = 60; type = 'triangle'; break;
    }

    this.bgmNode.type = type;
    this.bgmNode.frequency.setValueAtTime(freq, this.ctx.currentTime);
    
    // Add a simple rhythmic "pulse" to the BGM
    const lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();
    lfo.frequency.value = 2; // 2Hz pulse
    lfoGain.gain.value = 0.02;
    lfo.connect(lfoGain);
    lfoGain.connect(bgmGain.gain);
    lfo.start();

    this.bgmNode.connect(bgmGain);
    bgmGain.connect(this.masterGain);
    
    this.bgmNode.start();
    this.isPlaying = true;
  }

  stopBGM() {
    if (this.bgmNode) {
      this.bgmNode.stop();
      this.bgmNode.disconnect();
      this.bgmNode = null;
    }
    this.isPlaying = false;
  }

  playRainPlink(lane) {
    if (!this.initialized) this.init();
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const frequencies = [261.63, 293.66, 329.63, 349.23];
    osc.frequency.value = frequencies[lane] || 261.63;
    osc.type = 'sine';
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.2);
  }

  playSynthBeep(note = 0) {
    if (!this.initialized) this.init();
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.frequency.value = 440 * Math.pow(2, note / 12);
    osc.type = 'square';
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.1);
  }

  playHitSound() {
    if (!this.initialized) this.init();
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.frequency.value = 880;
    osc.type = 'triangle';
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.1);
  }

  setVolume(val) {
    if (this.masterGain) this.masterGain.gain.value = val;
  }
}

const audioEngine = new AudioEngine();
export default audioEngine;