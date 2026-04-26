import audioEngine from '../AudioEngine.js';

export const HIGHWAY_KEYS = ['1', '2', '3', '4'];
export const HIGHWAY_COLORS = ['#ff00ff', '#00ffff', '#ffff00', '#ff0000'];

export class NeonBar {
  constructor(canvas, lane) {
    this.canvas = canvas;
    this.lane = lane;
    this.z = 0; // 0 to 1
    this.speed = 0.005 + Math.random() * 0.003; // Slower speed
    this.active = true;
    this.missed = false;
  }

  update() {
    if (!this.active) return;
    this.z += this.speed;
    if (this.z > 1.1) {
      this.missed = true;
      this.active = false;
    }
  }

  draw(ctx, canvas) {
    if (!this.active) return;

    const centerX = canvas.width / 2;
    const horizonY = canvas.height * 0.3;
    const bottomY = canvas.height;
    
    // Perspective math
    const y = horizonY + (bottomY - horizonY) * this.z;
    const scale = this.z;
    const width = 100 * scale;
    const x = centerX + (this.lane - 1.5) * 150 * scale;

    ctx.fillStyle = HIGHWAY_COLORS[this.lane];
    ctx.shadowBlur = 15;
    ctx.shadowColor = HIGHWAY_COLORS[this.lane];
    ctx.fillRect(x - width / 2, y - 5, width, 10);
    ctx.shadowBlur = 0;
  }

  hit() {
    this.active = false;
    audioEngine.playSynthBeep(this.lane * 2 + 5);
  }
}

export function drawHighwayBackground(ctx, canvas) {
  ctx.fillStyle = '#120458'; // Deep purple
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const centerX = canvas.width / 2;
  const horizonY = canvas.height * 0.3;
  const bottomY = canvas.height;

  // Draw perspective lanes
  ctx.strokeStyle = '#ff00ff';
  ctx.lineWidth = 2;
  for (let i = 0; i <= 4; i++) {
    const xBottom = centerX + (i - 2) * 300;
    const xTop = centerX + (i - 2) * 20;
    ctx.beginPath();
    ctx.moveTo(xTop, horizonY);
    ctx.lineTo(xBottom, bottomY);
    ctx.stroke();
  }

  // Hit zone
  ctx.strokeStyle = '#00ffff';
  ctx.setLineDash([10, 5]);
  ctx.beginPath();
  ctx.moveTo(0, bottomY - 50);
  ctx.lineTo(canvas.width, bottomY - 50);
  ctx.stroke();
  ctx.setLineDash([]);

  // Lane labels
  HIGHWAY_KEYS.forEach((key, i) => {
    const x = centerX + (i - 1.5) * 230;
    ctx.fillStyle = '#00ffff';
    ctx.font = 'bold 20px Orbitron, sans-serif';
    ctx.fillText(key, x, bottomY - 20);
  });
}

export function generateHighwayNotes(count = 80) {
  const data = [];
  for (let i = 0; i < count; i++) {
    data.push({
      lane: Math.floor(Math.random() * 4),
      time: 2000 + i * 500
    });
  }
  return data;
}
