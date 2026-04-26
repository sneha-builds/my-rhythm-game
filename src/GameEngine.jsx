import { useEffect, useRef, useCallback } from 'react';
import audioEngine from './AudioEngine.js';
import {
  RainTile,
  generateNoteData,
  drawRainBackground,
  getLaneFromKey as getRainLane,
} from './modes/RainLogic.js';
import {
  HackerBit,
  drawHackerBackground,
  generateHackerNotes,
  HACKER_KEYS
} from './modes/HackerLogic.js';
import {
  NeonBar,
  drawHighwayBackground,
  generateHighwayNotes,
  HIGHWAY_KEYS
} from './modes/HighwayLogic.js';
import {
  SamuraiTarget,
  drawSamuraiBackground,
  generateSamuraiNotes,
  SAMURAI_KEYS
} from './modes/SamuraiLogic.js';

const MODE_STRATEGIES = {
  RAIN: {
    init: (canvas) => ({
      items: [],
      noteData: generateNoteData(100),
      startTime: null,
      score: 0,
      combo: 0,
      maxCombo: 0,
      nextNoteIndex: 0,
      gameStarted: false,
      gameOver: false,
      judgments: []
    }),
    update: (ctx, state, canvas) => {
      if (!state.gameStarted || state.gameOver) return state;
      const elapsed = performance.now() - state.startTime;
      while (state.nextNoteIndex < state.noteData.length && state.noteData[state.nextNoteIndex].time < elapsed) {
        state.items.push(new RainTile(canvas, state.noteData[state.nextNoteIndex].lane));
        state.nextNoteIndex++;
      }
      state.items = state.items.filter(item => {
        item.update();
        if (item.missed && !item.counted) {
          item.counted = true;
          state.combo = 0;
          state.judgments.push({ text: 'MISS', alpha: 1, x: item.x + item.width/2, y: canvas.height - 150 });
        }
        return item.active || item.hitEffect > 0;
      });
      state.judgments = state.judgments.filter(j => { j.alpha -= 0.02; j.y -= 1; return j.alpha > 0; });
      if (state.nextNoteIndex >= state.noteData.length && state.items.length === 0) state.gameOver = true;
      return state;
    },
    draw: (ctx, state, canvas) => {
      drawRainBackground(ctx, canvas);
      state.items.forEach(item => item.draw(ctx));
      state.judgments.forEach(j => {
        ctx.fillStyle = `rgba(255, 255, 255, ${j.alpha})`;
        ctx.font = 'bold 20px "Orbitron", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(j.text, j.x, j.y);
      });
      drawUI(ctx, state, canvas);
    },
    handleKey: (key, state, canvas) => {
      const lane = getRainLane(key);
      if (lane === null) return state;
      if (!state.gameStarted) {
        state.gameStarted = true; state.startTime = performance.now();
        audioEngine.init(); return state;
      }
      const hitZoneY = canvas.height - 100;
      const hitItem = state.items.find(item => item.active && item.lane === lane && item.y + item.height > hitZoneY - 50 && item.y < canvas.height);
      if (hitItem) {
        const dist = Math.abs((hitItem.y + hitItem.height/2) - (hitZoneY + 50));
        let judgment = dist < 40 ? 'PERFECT' : 'GOOD';
        hitItem.hit();
        state.score += (judgment === 'PERFECT' ? 200 : 100) + state.combo * 10;
        state.combo++; state.maxCombo = Math.max(state.combo, state.maxCombo);
        state.judgments.push({ text: judgment, alpha: 1, x: hitItem.x + hitItem.width/2, y: hitZoneY - 20 });
      } else {
        state.combo = 0; audioEngine.playHitSound();
      }
      return state;
    }
  },
  HACKER: {
    init: (canvas) => ({
      items: [],
      noteData: generateHackerNotes(100),
      startTime: null,
      score: 0,
      combo: 0,
      maxCombo: 0,
      nextNoteIndex: 0,
      gameStarted: false,
      gameOver: false,
      judgments: []
    }),
    update: (ctx, state, canvas) => {
      if (!state.gameStarted || state.gameOver) return state;
      const elapsed = performance.now() - state.startTime;
      while (state.nextNoteIndex < state.noteData.length && state.noteData[state.nextNoteIndex].time < elapsed) {
        state.items.push(new HackerBit(canvas, state.noteData[state.nextNoteIndex].lane));
        state.nextNoteIndex++;
      }
      state.items = state.items.filter(item => {
        item.update();
        if (item.missed && !item.counted) {
          item.counted = true;
          state.combo = 0;
          state.judgments.push({ text: 'ERROR', alpha: 1, x: item.x + item.width/2, y: canvas.height - 150 });
        }
        return item.active || item.hitEffect > 0;
      });
      state.judgments = state.judgments.filter(j => { j.alpha -= 0.02; j.y -= 1; return j.alpha > 0; });
      if (state.nextNoteIndex >= state.noteData.length && state.items.length === 0) state.gameOver = true;
      return state;
    },
    draw: (ctx, state, canvas) => {
      drawHackerBackground(ctx, canvas);
      state.items.forEach(item => item.draw(ctx));
      state.judgments.forEach(j => {
        ctx.fillStyle = `rgba(0, 255, 65, ${j.alpha})`;
        ctx.font = 'bold 20px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(j.text, j.x, j.y);
      });
      drawUI(ctx, state, canvas);
    },
    handleKey: (key, state, canvas) => {
      const lane = HACKER_KEYS.indexOf(key);
      if (lane === -1) return state;
      if (!state.gameStarted) {
        state.gameStarted = true; state.startTime = performance.now();
        audioEngine.init(); return state;
      }
      const hitZoneY = canvas.height - 100;
      const hitItem = state.items.find(item => item.active && item.lane === lane && item.y + item.height > hitZoneY - 50 && item.y < canvas.height);
      if (hitItem) {
        hitItem.hit();
        state.score += 150 + state.combo * 15;
        state.combo++; state.maxCombo = Math.max(state.combo, state.maxCombo);
        state.judgments.push({ text: 'DECODED', alpha: 1, x: hitItem.x + hitItem.width/2, y: hitZoneY - 30 });
      } else {
        state.combo = 0; audioEngine.playHitSound();
      }
      return state;
    }
  },
  HIGHWAY: {
    init: (canvas) => ({
      items: [],
      noteData: generateHighwayNotes(100),
      startTime: null,
      score: 0,
      combo: 0,
      maxCombo: 0,
      nextNoteIndex: 0,
      gameStarted: false,
      gameOver: false,
      judgments: []
    }),
    update: (ctx, state, canvas) => {
      if (!state.gameStarted || state.gameOver) return state;
      const elapsed = performance.now() - state.startTime;
      while (state.nextNoteIndex < state.noteData.length && state.noteData[state.nextNoteIndex].time < elapsed) {
        state.items.push(new NeonBar(canvas, state.noteData[state.nextNoteIndex].lane));
        state.nextNoteIndex++;
      }
      state.items = state.items.filter(item => {
        item.update();
        if (item.missed && !item.counted) {
          item.counted = true;
          state.combo = 0;
          state.judgments.push({ text: 'MISS', alpha: 1, x: canvas.width/2, y: canvas.height * 0.5 });
        }
        return item.active;
      });
      state.judgments = state.judgments.filter(j => { j.alpha -= 0.02; j.y -= 1; return j.alpha > 0; });
      if (state.nextNoteIndex >= state.noteData.length && state.items.length === 0) state.gameOver = true;
      return state;
    },
    draw: (ctx, state, canvas) => {
      drawHighwayBackground(ctx, canvas);
      state.items.forEach(item => item.draw(ctx, canvas));
      state.judgments.forEach(j => {
        ctx.fillStyle = `rgba(0, 255, 255, ${j.alpha})`;
        ctx.font = 'bold 30px "Orbitron", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(j.text, j.x, j.y);
      });
      drawUI(ctx, state, canvas);
    },
    handleKey: (key, state, canvas) => {
      const lane = HIGHWAY_KEYS.indexOf(key);
      if (lane === -1) return state;
      if (!state.gameStarted) {
        state.gameStarted = true; state.startTime = performance.now();
        audioEngine.init(); return state;
      }
      const hitItem = state.items.find(item => item.active && item.lane === lane && item.z > 0.85 && item.z < 1.1);
      if (hitItem) {
        hitItem.hit();
        state.score += 200 + state.combo * 20;
        state.combo++; state.maxCombo = Math.max(state.combo, state.maxCombo);
        state.judgments.push({ text: 'PERFECT', alpha: 1, x: canvas.width/2, y: canvas.height * 0.5 });
      } else {
        state.combo = 0; audioEngine.playHitSound();
      }
      return state;
    }
  },
  SAMURAI: {
    init: (canvas) => ({
      items: [],
      noteData: generateSamuraiNotes(60),
      startTime: null,
      score: 0,
      combo: 0,
      maxCombo: 0,
      nextNoteIndex: 0,
      gameStarted: false,
      gameOver: false,
      judgments: []
    }),
    update: (ctx, state, canvas) => {
      if (!state.gameStarted || state.gameOver) return state;
      const elapsed = performance.now() - state.startTime;
      while (state.nextNoteIndex < state.noteData.length && state.noteData[state.nextNoteIndex].time < elapsed) {
        state.items.push(new SamuraiTarget(canvas, state.noteData[state.nextNoteIndex].lane));
        state.nextNoteIndex++;
      }
      state.items = state.items.filter(item => {
        item.update();
        if (item.missed && !item.counted) {
          item.counted = true;
          state.combo = 0;
          state.judgments.push({ text: 'MISS', alpha: 1, x: item.x + item.width/2, y: canvas.height * 0.5 });
        }
        return item.active || item.sliced;
      });
      state.judgments = state.judgments.filter(j => { j.alpha -= 0.02; j.y -= 1; return j.alpha > 0; });
      if (state.nextNoteIndex >= state.noteData.length && state.items.length === 0) state.gameOver = true;
      return state;
    },
    draw: (ctx, state, canvas) => {
      drawSamuraiBackground(ctx, canvas);
      state.items.forEach(item => item.draw(ctx));
      state.judgments.forEach(j => {
        ctx.fillStyle = `rgba(255, 77, 77, ${j.alpha})`;
        ctx.font = 'bold 30px serif';
        ctx.textAlign = 'center';
        ctx.fillText(j.text, j.x, j.y);
      });
      drawUI(ctx, state, canvas);
    },
    handleKey: (key, state, canvas) => {
      const lane = SAMURAI_KEYS.indexOf(key);
      if (lane === -1) return state;
      if (!state.gameStarted) {
        state.gameStarted = true; state.startTime = performance.now();
        audioEngine.init(); return state;
      }
      const hitY = canvas.height * 0.8;
      const hitItem = state.items.find(item => item.active && item.lane === lane && item.y + item.height > hitY - 40 && item.y < canvas.height);
      if (hitItem) {
        hitItem.hit();
        state.score += 300 + state.combo * 30;
        state.combo++; state.maxCombo = Math.max(state.combo, state.maxCombo);
        state.judgments.push({ text: 'SLASH!', alpha: 1, x: hitItem.x + hitItem.width/2, y: canvas.height * 0.5 });
      } else {
        state.combo = 0; audioEngine.playHitSound();
      }
      return state;
    }
  }
};

function drawUI(ctx, state, canvas) {
  ctx.fillStyle = '#00ffff'; ctx.font = '20px "Orbitron", sans-serif'; ctx.textAlign = 'left';
  ctx.shadowBlur = 10; ctx.shadowColor = '#00ffff';
  ctx.fillText(`SCORE: ${state.score}`, 20, 35);
  ctx.fillStyle = '#ff00ff'; ctx.shadowColor = '#ff00ff';
  ctx.fillText(`COMBO: ${state.combo}`, 20, 65);
  ctx.shadowBlur = 0;

  if (state.gameOver) {
    ctx.fillStyle = 'rgba(5, 5, 16, 0.85)'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#ff00ff'; ctx.textAlign = 'center'; ctx.font = '40px "Press Start 2P", cursive';
    ctx.shadowBlur = 20; ctx.shadowColor = '#ff00ff';
    ctx.fillText('STAGE CLEAR', canvas.width / 2, canvas.height / 2 - 40);
    ctx.fillStyle = '#00ffff'; ctx.shadowColor = '#00ffff'; ctx.font = '20px "Press Start 2P", cursive';
    ctx.fillText(`SCORE: ${state.score}`, canvas.width / 2, canvas.height / 2 + 30);
    ctx.fillText(`MAX COMBO: ${state.maxCombo}`, canvas.width / 2, canvas.height / 2 + 70);
    ctx.shadowBlur = 0;
  }

  if (!state.gameStarted) {
    ctx.fillStyle = 'rgba(5, 5, 16, 0.7)'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#00ffff'; ctx.font = '24px "Orbitron", sans-serif'; ctx.textAlign = 'center';
    ctx.shadowBlur = 15; ctx.shadowColor = '#00ffff';
    let msg = 'PRESS ANY LANE KEY TO START';
    if (state.mode === 'RAIN') msg = 'PRESS D, F, J, OR K TO START';
    if (state.mode === 'HACKER') msg = 'PRESS A, S, K, OR L TO START';
    if (state.mode === 'HIGHWAY') msg = 'PRESS 1, 2, 3, OR 4 TO START';
    if (state.mode === 'SAMURAI') msg = 'PRESS F OR J TO START';
    ctx.fillText(msg, canvas.width / 2, canvas.height / 2);
    ctx.shadowBlur = 0;
  }
}

export default function GameEngine({ mode, onBack }) {
  const canvasRef = useRef(null);
  const stateRef = useRef(null);
  const rafRef = useRef(null);

  const handleKeyDown = useCallback((e) => {
    const key = e.key.toLowerCase();
    const strategy = MODE_STRATEGIES[mode];
    if (strategy && strategy.handleKey) {
      stateRef.current = strategy.handleKey(key, stateRef.current, canvasRef.current);
    }
  }, [mode]);

  useEffect(() => {
    const strategy = MODE_STRATEGIES[mode] || MODE_STRATEGIES.RAIN;
    stateRef.current = strategy.init(canvasRef.current);
    stateRef.current.mode = mode;
    window.addEventListener('keydown', handleKeyDown);
    document.fonts.ready.then(() => {
      const canvas = canvasRef.current; if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const gameLoop = () => {
        stateRef.current = strategy.update(ctx, stateRef.current, canvas);
        strategy.draw(ctx, stateRef.current, canvas);
        rafRef.current = requestAnimationFrame(gameLoop);
      };
      rafRef.current = requestAnimationFrame(gameLoop);
    });
    return () => { window.removeEventListener('keydown', handleKeyDown); cancelAnimationFrame(rafRef.current); };
  }, [mode, handleKeyDown]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen relative p-4">
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-fuchsia-900/10 to-transparent pointer-events-none" />
      <div className="z-10 flex flex-col items-center">
        <div className="p-2 glass-panel rounded-2xl neon-border animate-pulse-glow bg-[#050510]">
          <canvas ref={canvasRef} width={800} height={600} className="rounded-xl block" style={{ maxWidth: '100%', height: 'auto', backgroundColor: '#050510' }} />
        </div>
        <button onClick={onBack} className="mt-8 px-8 py-3 bg-transparent border-2 border-cyan-400 text-cyan-400 font-bold font-mono tracking-widest rounded hover:bg-cyan-400/20 hover:shadow-[0_0_15px_rgba(0,255,255,0.5)] transition-all uppercase">
          [ ABORT MISSION ]
        </button>
      </div>
    </div>
  );
}
