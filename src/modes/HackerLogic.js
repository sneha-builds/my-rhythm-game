import audioEngine from '../AudioEngine.js';

export const HACKER_KEYS = ['a', 's', 'k', 'l'];
export const LANE_POSITIONS = [0.25, 0.41, 0.58, 0.75];

export class HackerBit {
  constructor(canvas, lane) {
    this.canvas = canvas;
    this.lane = lane;
    this.x = canvas.width * LANE_POSITIONS[lane];
    this.y = -20;
    this.speed = 3 + Math.random() * 2; // Slower speed
    this.char = Math.random() > 0.5 ? '1' : '0';
    this.active = true;
    this.missed = false;
    this.hitEffect = 0;
  }

  update() {
    if (!this.active) {
      if (this.hitEffect > 0) this.hitEffect -= 0.1;
      return;
    }
    this.y += this.speed;
    if (this.y > this.canvas.height - 40) {
      this.missed = true;
      this.active = false;
    }
  }

  draw(ctx) {
    if (!this.active && this.hitEffect <= 0) return;

    if (this.active) {
      ctx.fillStyle = '#00ff41';
      ctx.font = 'bold 24px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(this.char, this.x, this.y);
      
      // Glow effect
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#00ff41';
      ctx.fillText(this.char, this.x, this.y);
      ctx.shadowBlur = 0;
    }

    if (this.hitEffect > 0) {
      ctx.fillStyle = `rgba(0, 255, 65, ${this.hitEffect})`;
      ctx.font = 'bold 32px monospace';
      ctx.fillText('CODE', this.x, this.y);
    }
  }

  hit() {
    this.active = false;
    this.hitEffect = 1;
    audioEngine.playSynthBeep(Math.floor(Math.random() * 12));
  }
}

export function drawHackerBackground(ctx, canvas) {
  ctx.fillStyle = '#0a0a0a';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Drawing grid lines
  ctx.strokeStyle = 'rgba(0, 255, 65, 0.1)';
  ctx.lineWidth = 2;
  LANE_POSITIONS.forEach(pos => {
    const x = canvas.width * pos;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  });

  // Hit zone
  const hitY = canvas.height - 50;
  ctx.fillStyle = 'rgba(0, 255, 65, 0.2)';
  ctx.fillRect(0, hitY - 20, canvas.width, 40);
  
  ctx.strokeStyle = '#00ff41';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, hitY);
  ctx.lineTo(canvas.width, hitY);
  ctx.stroke();

  LANE_POSITIONS.forEach((pos, i) => {
    const x = canvas.width * pos;
    ctx.fillStyle = '#00ff41';
    ctx.font = '12px monospace';
    ctx.fillText(`[${HACKER_KEYS[i].toUpperCase()}]`, x, hitY + 30);
  });
}

export function generateHackerNotes(count = 60) {
  const data = [];
  for (let i = 0; i < count; i++) {
    data.push({
      lane: Math.floor(Math.random() * 4),
      time: 1500 + i * 600 + Math.random() * 100
    });
  }
  return data;
}
