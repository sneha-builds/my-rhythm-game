import audioEngine from '../AudioEngine.js';

export const SAMURAI_KEYS = ['f', 'j'];

export class SamuraiTarget {
  constructor(canvas, side) {
    this.canvas = canvas;
    this.side = side; // 0 for left, 1 for right
    this.x = side === 0 ? -50 : canvas.width + 50;
    this.y = canvas.height * 0.4 + Math.random() * canvas.height * 0.3;
    this.speed = (side === 0 ? 1 : -1) * (3.5 + Math.random() * 2.5); // Slower speed
    this.active = true;
    this.missed = false;
    this.sliced = false;
    this.radius = 30;
  }

  update() {
    if (this.sliced) return;
    this.x += this.speed;
    
    if (this.side === 0 && this.x > this.canvas.width + 50) {
      this.missed = true;
      this.active = false;
    }
    if (this.side === 1 && this.x < -50) {
      this.missed = true;
      this.active = false;
    }
  }

  draw(ctx) {
    if (!this.active && !this.sliced) return;

    if (this.sliced) {
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(this.x - 40, this.y - 40);
      ctx.lineTo(this.x + 40, this.y + 40);
      ctx.stroke();
      return;
    }

    ctx.fillStyle = '#ff4d4d';
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 3;
    ctx.stroke();
    
    // Japanese character-like symbol
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 20px serif';
    ctx.textAlign = 'center';
    ctx.fillText('斬', this.x, this.y + 7);
  }

  hit() {
    this.sliced = true;
    this.active = false;
    setTimeout(() => { this.sliced = false; }, 200);
    audioEngine.playHitSound();
  }
}

export function drawSamuraiBackground(ctx, canvas) {
  // Sunset gradient
  const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
  grad.addColorStop(0, '#2c3e50');
  grad.addColorStop(0.5, '#000000');
  grad.addColorStop(1, '#c0392b');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Red sun
  ctx.fillStyle = '#e74c3c';
  ctx.beginPath();
  ctx.arc(canvas.width / 2, canvas.height * 0.4, 80, 0, Math.PI * 2);
  ctx.fill();

  // Slash zones
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.setLineDash([5, 10]);
  ctx.beginPath();
  ctx.moveTo(canvas.width * 0.3, 0);
  ctx.lineTo(canvas.width * 0.3, canvas.height);
  ctx.moveTo(canvas.width * 0.7, 0);
  ctx.lineTo(canvas.width * 0.7, canvas.height);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.fillStyle = '#fff';
  ctx.font = 'bold 16px serif';
  ctx.textAlign = 'center';
  ctx.fillText(`[${SAMURAI_KEYS[0].toUpperCase()}]`, canvas.width * 0.3, canvas.height - 20);
  ctx.fillText(`[${SAMURAI_KEYS[1].toUpperCase()}]`, canvas.width * 0.7, canvas.height - 20);
}

export function generateSamuraiNotes(count = 50) {
  const data = [];
  for (let i = 0; i < count; i++) {
    data.push({
      lane: Math.random() > 0.5 ? 0 : 1, // 0 for left zone, 1 for right zone
      time: 1000 + i * 1200 + Math.random() * 500
    });
  }
  return data;
}
