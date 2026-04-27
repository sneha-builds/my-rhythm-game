class AudioEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.initialized = false;
    this.currentLoop = null;
    this.notes = [];
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
    this.resume();

    const bpm = 120;
    const noteLength = 60 / bpm; // 0.5s for quarter note
    let sequence = [];
    let instrumentType = 'sine';

    switch(mode) {
      case 'RAIN': // Taylor Swift Vibe (Acoustic Arpeggio)
        instrumentType = 'sine';
        sequence = [261.63, 329.63, 392.00, 440.00]; // C4, E4, G4, A4 (Soft Pop)
        this.playArtistLoop(sequence, instrumentType, noteLength, 0.1, 0.4);
        break;

      case 'HACKER': // BTS Vibe (Disco Pop Pulse)
        instrumentType = 'square';
        sequence = [196.00, 196.00, 261.63, 220.00]; // G3, G3, C4, A3 (Snappy)
        this.playArtistLoop(sequence, instrumentType, noteLength / 2, 0.05, 0.2);
        break;

      case 'HIGHWAY': // The Weeknd Vibe (80s Synthwave Bass)
        instrumentType = 'sawtooth';
        sequence = [110.00, 110.00, 130.81, 146.83]; // A2, A2, C3, D3 (Driving)
        this.playArtistLoop(sequence, instrumentType, noteLength, 0.15, 0.3);
        break;

      case 'SAMURAI': // Selena Gomez Vibe (Moody Ambient Pop)
        instrumentType = 'triangle';
        sequence = [174.61, 130.81, 146.83, 110.00]; // F3, C3, D3, A2 (Smooth)
        this.playArtistLoop(sequence, instrumentType, noteLength * 2, 0.2, 0.4);
        break;
    }
  }

  playArtistLoop(sequence, type, stepTime, gainVal, decay) {
    let step = 0;
    const playStep = () => {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      
      osc.type = type;
      osc.frequency.setValueAtTime(sequence[step % sequence.length], now);
      
      g.gain.setValueAtTime(0, now);
      g.gain.linearRampToValueAtTime(gainVal, now + 0.05);
      g.gain.exponentialRampToValueAtTime(0.001, now + decay);
      
      osc.connect(g);
      g.connect(this.masterGain);
      
      osc.start(now);
      osc.stop(now + decay);
      this.notes.push(osc);
      
      step++;
    };

    playStep();
    this.currentLoop = setInterval(playStep, stepTime * 1000);
  }

  stopBGM() {
    if (this.currentLoop) {
      clearInterval(this.currentLoop);
      this.currentLoop = null;
    }
    this.notes.forEach(n => { try { n.stop(); } catch(e) {} });
    this.notes = [];
  }

  // Enhanced Hit Sounds
  playRainPlink(lane) {
    this.playTone([523.25, 587.33, 659.25, 698.46][lane], 'sine', 0.4, 0.3);
  }

  playSynthBeep(note = 0) {
    this.playTone(440 * Math.pow(2, note / 12), 'triangle', 0.3, 0.2);
  }

  playHitSound() {
    this.playTone(150, 'triangle', 0.5, 0.15, true); // Percussive thud
  }

  playTone(freq, type, volume, decay, sweep = false) {
    if (!this.initialized) this.init();
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    if (sweep) osc.frequency.exponentialRampToValueAtTime(40, now + decay);
    
    g.gain.setValueAtTime(volume, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + decay);
    
    osc.connect(g);
    g.connect(this.masterGain);
    osc.start();
    osc.stop(now + decay);
  }

  setVolume(val) {
    if (this.masterGain) this.masterGain.gain.value = val;
  }
}

const audioEngine = new AudioEngine();
export default audioEngine;