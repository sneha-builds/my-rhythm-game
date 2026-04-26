import audioEngine from '../AudioEngine.js';

export const HIGHWAY_KEYS = ['1', '2', '3', '4'];
export const HIGHWAY_COLORS = ['#ff00ff', '#00ffff', '#ffff00', '#00ff00'];

export class NeonBar {
  constructor(canvas, lane) {
    this.canvas = canvas;
    this.lane = lane;
    this.z = 0; // 0 (horizon) to 1 (bottom)
    this.speed = 0.006;
    this.active = true;
    this.missed = false;
  }

  update() {
    if (!this.active) return;
    this.z += this.speed;
    if (this.z > 1.2) {
      this.missed = true;
      this.active = false;
    }
  }

  draw(ctx, canvas) {
    if (!this.active) return;

    const centerX = canvas.width / 2;
    const horizonY = canvas.height * 0.3;
    const bottomY = canvas.height;
    
    // Perspective
    const y = horizonY + (bottomY - horizonY) * this.z;
    const scale = this.z;
    const width = 120 * scale;
    const height = 40 * scale;
    const x = centerX + (this.lane - 1.5) * 200 * scale;

    const grad = ctx.createLinearGradient(x, y, x, y + height);
    grad.addColorStop(0, HIGHWAY_COLORS[this.lane]);
    grad.addColorStop(1, 'transparent');
    
    ctx.fillStyle = grad;
    ctx.shadowBlur = 15 * scale;
    ctx.shadowColor = HIGHWAY_COLORS[this.lane];
    ctx.fillRect(x - width / 2, y, width, height);
    ctx.shadowBlur = 0;
  }

  hit() {
    this.active = false;
    audioEngine.playSynthBeep(this.lane * 2 + 5);
  }
}

export function drawHighwayBackground(ctx, canvas) {
  ctx.fillStyle = '#050510';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const centerX = canvas.width / 2;
  const horizonY = canvas.height * 0.3;
  
  // Perspective lanes
  ctx.strokeStyle = '#00ffff';
  ctx.lineWidth = 2;
  for (let i = 0; i <= 4; i++) {
    const xBottom = centerX + (i - 2) * 400;
    const xTop = centerX + (i - 2) * 10;
    ctx.beginPath(); ctx.moveTo(xTop, horizonY); ctx.lineTo(xBottom, canvas.height); ctx.stroke();
  }

  // Hit zone (Belt)
  const hitZStart = 0.85;
  const hitZEnd = 0.95;
  const hitYStart = horizonY + (canvas.height - horizonY) * hitZStart;
  const hitYEnd = horizonY + (canvas.height - horizonY) * hitZEnd;
  
  ctx.fillStyle = 'rgba(0, 255, 255, 0.1)';
  ctx.fillRect(0, hitYStart, canvas.width, hitYEnd - hitYStart);
  
  ctx.strokeStyle = 'rgba(0, 255, 255, 0.5)';
  ctx.lineWidth = 2;
  ctx.strokeRect(0, hitYStart, canvas.width, hitYEnd - hitYStart);

  HIGHWAY_KEYS.forEach((key, i) => {
    const x = centerX + (i - 1.5) * 300;
    ctx.fillStyle = '#00ffff';
    ctx.font = 'bold 24px "Orbitron", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(key, x, canvas.height - 20);
  });
}

export function generateHighwayNotes(count = 100) {
  const data = [];
  for (let i = 0; i < count; i++) {
    data.push({ lane: Math.floor(Math.random() * 4), time: 2000 + i * 500 });
  }
  return data;
}
