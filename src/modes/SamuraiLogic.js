import audioEngine from '../AudioEngine.js';

export const SAMURAI_KEYS = ['f', 'j'];
export const SAMURAI_COLORS = ['#e74c3c', '#c0392b'];

export class SamuraiTarget {
  constructor(canvas, lane) {
    this.canvas = canvas;
    this.lane = lane; // 0 for left, 1 for right
    this.width = canvas.width * 0.4;
    this.height = 40;
    this.x = lane === 0 ? canvas.width * 0.05 : canvas.width * 0.55;
    this.y = -this.height;
    this.speed = 5;
    this.active = true;
    this.missed = false;
    this.sliced = false;
    this.sliceAlpha = 0;
  }

  update() {
    if (this.sliced) {
      this.sliceAlpha -= 0.05;
      return;
    }
    this.y += this.speed;
    if (this.y > this.canvas.height) {
      this.missed = true;
      this.active = false;
    }
  }

  draw(ctx) {
    if (!this.active && !this.sliced) return;

    if (this.sliced) {
      ctx.strokeStyle = `rgba(255, 255, 255, ${this.sliceAlpha})`;
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(this.x - 20, this.y + this.height/2);
      ctx.lineTo(this.x + this.width + 20, this.y + this.height/2);
      ctx.stroke();
      return;
    }

    // Target as a scroll or tile
    ctx.fillStyle = SAMURAI_COLORS[this.lane];
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.fillRect(this.x, this.y, this.width, this.height);
    ctx.strokeRect(this.x, this.y, this.width, this.height);
    
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 20px serif';
    ctx.textAlign = 'center';
    ctx.fillText('斬', this.x + this.width/2, this.y + this.height/2 + 7);
  }

  hit() {
    this.sliced = true;
    this.active = false;
    this.sliceAlpha = 1;
    audioEngine.playHitSound();
  }
}

export function drawSamuraiBackground(ctx, canvas) {
  const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
  grad.addColorStop(0, '#2c3e50');
  grad.addColorStop(0.5, '#000000');
  grad.addColorStop(1, '#c0392b');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Red sun
  ctx.fillStyle = '#e74c3c';
  ctx.beginPath(); ctx.arc(canvas.width / 2, canvas.height * 0.3, 80, 0, Math.PI * 2); ctx.fill();

  // Hit zone line
  const hitY = canvas.height * 0.8;
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
  ctx.lineWidth = 2;
  ctx.setLineDash([10, 10]);
  ctx.beginPath(); ctx.moveTo(0, hitY); ctx.lineTo(canvas.width, hitY); ctx.stroke();
  ctx.setLineDash([]);

  // Lane guides
  ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.fillRect(canvas.width * 0.05, 0, canvas.width * 0.4, canvas.height);
  ctx.fillRect(canvas.width * 0.55, 0, canvas.width * 0.4, canvas.height);

  ctx.fillStyle = '#fff';
  ctx.font = 'bold 20px serif';
  ctx.textAlign = 'center';
  ctx.fillText(`[${SAMURAI_KEYS[0].toUpperCase()}]`, canvas.width * 0.25, canvas.height - 20);
  ctx.fillText(`[${SAMURAI_KEYS[1].toUpperCase()}]`, canvas.width * 0.75, canvas.height - 20);
}

export function generateSamuraiNotes(count = 60) {
  const data = [];
  for (let i = 0; i < count; i++) {
    data.push({ lane: Math.random() > 0.5 ? 0 : 1, time: 1000 + i * 900 });
  }
  return data;
}
