import audioEngine from '../AudioEngine.js';

export const RAIN_LANE_COLORS = ['#6366f1', '#ec4899', '#14b8a6', '#f59e0b'];
export const RAIN_KEYS = ['d', 'f', 'j', 'k'];
export const LANE_POSITIONS = [0.2, 0.4, 0.6, 0.8];

export class Raindrop {
  constructor(canvas, lane) {
    this.canvas = canvas;
    this.lane = lane;
    this.x = canvas.width * LANE_POSITIONS[lane];
    this.y = -50;
    this.speed = 2.5 + Math.random() * 1.5; // Slower speed
    this.radius = 15;
    this.active = true;
    this.missed = false;
    this.ripple = null;
  }

  update() {
    if (!this.active) return;
    this.y += this.speed;
    
    if (this.y > this.canvas.height - 60) {
      this.missed = true;
      this.active = false;
    }
    
    if (this.ripple) {
      this.ripple.radius += 2;
      this.ripple.alpha -= 0.03;
      if (this.ripple.alpha <= 0) {
        this.ripple = null;
      }
    }
  }

  draw(ctx) {
    if (!this.active && !this.ripple) return;
    
    const gradient = ctx.createLinearGradient(
      this.x - this.radius, this.y,
      this.x + this.radius, this.y + this.radius * 2
    );
    gradient.addColorStop(0, RAIN_LANE_COLORS[this.lane]);
    gradient.addColorStop(1, 'rgba(99, 102, 241, 0.3)');
    
    ctx.beginPath();
    ctx.ellipse(this.x, this.y, this.radius, this.radius * 1.5, 0, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();
    
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius * 0.5, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.fill();
  }

  hit() {
    this.active = false;
    this.ripple = {
      x: this.x,
      y: this.canvas.height - 50,
      radius: 10,
      alpha: 1
    };
    audioEngine.playRainPlink(this.lane);
  }

  getLane() {
    return this.lane;
  }
}

export function generateNoteData(count = 50, lanes = 4) {
  const data = [];
  const beatInterval = 800;
  
  for (let i = 0; i < count; i++) {
    const lane = Math.floor(Math.random() * lanes);
    const time = 1000 + i * beatInterval + Math.random() * 200;
    data.push({ lane, time, hit: false });
  }
  
  return data.sort((a, b) => a.time - b.time);
}

export function drawRainBackground(ctx, canvas, isDark) {
  ctx.fillStyle = isDark ? '#0f172a' : '#f8fafc';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  ctx.strokeStyle = isDark ? 'rgba(148, 163, 184, 0.1)' : 'rgba(100, 116, 139, 0.1)';
  ctx.lineWidth = 1;
  
  for (let i = 0; i < 4; i++) {
    const x = canvas.width * LANE_POSITIONS[i];
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }
  
  ctx.fillStyle = isDark ? 'rgba(99, 102, 241, 0.8)' : 'rgba(99, 102, 241, 0.6)';
  const hitY = canvas.height - 50;
  
  for (let i = 0; i < 4; i++) {
    const x = canvas.width * LANE_POSITIONS[i];
    ctx.beginPath();
    ctx.arc(x, hitY, 25, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = isDark ? '#0f172a' : '#f8fafc';
    ctx.font = 'bold 14px system-ui';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(RAIN_KEYS[i].toUpperCase(), x, hitY);
    
    ctx.fillStyle = isDark ? 'rgba(99, 102, 241, 0.8)' : 'rgba(99, 102, 241, 0.6)';
  }
}

export function drawRipple(ripple, ctx) {
  if (!ripple || ripple.alpha <= 0) return;
  
  ctx.beginPath();
  ctx.arc(ripple.x, ripple.y, ripple.radius, 0, Math.PI * 2);
  ctx.strokeStyle = `rgba(99, 102, 241, ${ripple.alpha})`;
  ctx.lineWidth = 2;
  ctx.stroke();
}

export function getLaneFromKey(key) {
  const idx = RAIN_KEYS.indexOf(key.toLowerCase());
  return idx !== -1 ? idx : null;
}