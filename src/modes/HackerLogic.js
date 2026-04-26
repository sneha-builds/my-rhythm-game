import audioEngine from '../AudioEngine.js';

export const HACKER_KEYS = ['a', 's', 'k', 'l'];
export const LANE_COUNT = 4;

export class HackerBit {
  constructor(canvas, lane) {
    this.canvas = canvas;
    this.lane = lane;
    this.width = canvas.width / LANE_COUNT;
    this.height = 60;
    this.x = lane * this.width;
    this.y = -this.height;
    this.speed = 4;
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
    if (this.y > this.canvas.height) {
      this.missed = true;
      this.active = false;
    }
  }

  draw(ctx) {
    if (!this.active && this.hitEffect <= 0) return;

    if (this.active) {
      ctx.fillStyle = 'rgba(0, 255, 65, 0.1)';
      ctx.strokeStyle = '#00ff41';
      ctx.lineWidth = 2;
      ctx.fillRect(this.x + 5, this.y, this.width - 10, this.height);
      ctx.strokeRect(this.x + 5, this.y, this.width - 10, this.height);
      
      ctx.fillStyle = '#00ff41';
      ctx.font = 'bold 24px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(this.char, this.x + this.width/2, this.y + this.height/2 + 8);
    }

    if (this.hitEffect > 0) {
      ctx.fillStyle = `rgba(0, 255, 65, ${this.hitEffect})`;
      ctx.fillRect(this.x, this.y, this.width, this.height);
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

  const laneWidth = canvas.width / LANE_COUNT;
  ctx.strokeStyle = 'rgba(0, 255, 65, 0.15)';
  for (let i = 1; i < LANE_COUNT; i++) {
    ctx.beginPath();
    ctx.moveTo(i * laneWidth, 0);
    ctx.lineTo(i * laneWidth, canvas.height);
    ctx.stroke();
  }

  const hitY = canvas.height - 100;
  ctx.fillStyle = 'rgba(0, 255, 65, 0.1)';
  ctx.fillRect(0, hitY, canvas.width, 100);
  ctx.strokeStyle = '#00ff41';
  ctx.strokeRect(0, hitY, canvas.width, 1);

  HACKER_KEYS.forEach((key, i) => {
    ctx.fillStyle = '#00ff41';
    ctx.font = '14px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`[${key.toUpperCase()}]`, i * laneWidth + laneWidth/2, canvas.height - 20);
  });
}

export function generateHackerNotes(count = 80) {
  const data = [];
  for (let i = 0; i < count; i++) {
    data.push({ lane: Math.floor(Math.random() * 4), time: 1500 + i * 600 });
  }
  return data;
}
