import audioEngine from '../AudioEngine.js';

export const RAIN_LANE_COLORS = ['#6366f1', '#ec4899', '#14b8a6', '#f59e0b'];
export const RAIN_KEYS = ['d', 'f', 'j', 'k'];
export const LANE_COUNT = 4;

export class RainTile {
  constructor(canvas, lane) {
    this.canvas = canvas;
    this.lane = lane;
    this.width = canvas.width / LANE_COUNT;
    this.height = 80; // Rectangular tile
    this.x = lane * this.width;
    this.y = -this.height;
    this.speed = 3.5; 
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
    
    // If it passes the hit zone (bottom)
    if (this.y > this.canvas.height) {
      this.missed = true;
      this.active = false;
    }
  }

  draw(ctx) {
    if (!this.active && this.hitEffect <= 0) return;

    if (this.active) {
      // Draw Tile
      const gradient = ctx.createLinearGradient(this.x, this.y, this.x, this.y + this.height);
      gradient.addColorStop(0, RAIN_LANE_COLORS[this.lane]);
      gradient.addColorStop(1, '#000000');
      
      ctx.fillStyle = gradient;
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1;
      ctx.fillRect(this.x + 2, this.y, this.width - 4, this.height);
      ctx.strokeRect(this.x + 2, this.y, this.width - 4, this.height);
      
      // Glow
      ctx.shadowBlur = 15;
      ctx.shadowColor = RAIN_LANE_COLORS[this.lane];
      ctx.strokeRect(this.x + 2, this.y, this.width - 4, this.height);
      ctx.shadowBlur = 0;
    }

    if (this.hitEffect > 0) {
      ctx.fillStyle = `rgba(255, 255, 255, ${this.hitEffect})`;
      ctx.fillRect(this.x, this.y, this.width, this.height);
    }
  }

  hit() {
    this.active = false;
    this.hitEffect = 1;
    audioEngine.playRainPlink(this.lane);
  }
}

export function drawRainBackground(ctx, canvas) {
  ctx.fillStyle = '#050510';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  const laneWidth = canvas.width / LANE_COUNT;
  
  // Lane Dividers
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.lineWidth = 1;
  for (let i = 1; i < LANE_COUNT; i++) {
    ctx.beginPath();
    ctx.moveTo(i * laneWidth, 0);
    ctx.lineTo(i * laneWidth, canvas.height);
    ctx.stroke();
  }
  
  // Hit Zone (Bottom Bar)
  const hitY = canvas.height - 100;
  ctx.fillStyle = 'rgba(99, 102, 241, 0.2)';
  ctx.fillRect(0, hitY, canvas.width, 100);
  
  ctx.strokeStyle = '#6366f1';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, hitY);
  ctx.lineTo(canvas.width, hitY);
  ctx.stroke();

  // Lane Keys
  for (let i = 0; i < LANE_COUNT; i++) {
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 20px "Orbitron", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(RAIN_KEYS[i].toUpperCase(), i * laneWidth + laneWidth/2, canvas.height - 30);
  }
}

export function generateNoteData(count = 60) {
  const data = [];
  const interval = 800;
  for (let i = 0; i < count; i++) {
    data.push({ lane: Math.floor(Math.random() * 4), time: 1000 + i * interval });
  }
  return data;
}

export function getLaneFromKey(key) {
  const idx = RAIN_KEYS.indexOf(key.toLowerCase());
  return idx !== -1 ? idx : null;
}
