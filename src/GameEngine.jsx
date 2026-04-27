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
    init: (canvas) => ({ items: [], noteData: generateNoteData(100), startTime: null, score: 0, combo: 0, maxCombo: 0, nextNoteIndex: 0, gameStarted: false, gameOver: false, judgments: [] }),
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
          item.counted = true; state.combo = 0;
          state.judgments.push({ text: 'MISS', alpha: 1, x: item.x + item.width/2, y: canvas.height - 200 });
        }
        return item.active || item.hitEffect > 0;
      });
      state.judgments = state.judgments.filter(j => { j.alpha -= 0.02; j.y -= 1; return j.alpha > 0; });
      if (state.nextNoteIndex >= state.noteData.length && state.items.length === 0) {
        state.gameOver = true;
        audioEngine.stopBGM();
      }
      return state;
    },
    draw: (ctx, state, canvas) => {
      drawRainBackground(ctx, canvas);
      state.items.forEach(item => item.draw(ctx));
      state.judgments.forEach(j => {
        ctx.fillStyle = `rgba(255, 255, 255, ${j.alpha})`; ctx.font = 'bold 32px "Orbitron", sans-serif'; ctx.textAlign = 'center';
        ctx.fillText(j.text, j.x, j.y);
      });
      drawUI(ctx, state, canvas);
    },
    handleKey: (key, state, canvas) => {
      const lane = getRainLane(key);
      if (lane === null) return state;
      if (!state.gameStarted) { 
        state.gameStarted = true; state.startTime = performance.now(); 
        audioEngine.init(); 
        audioEngine.startBGM('RAIN');
        return state; 
      }
      const hitZoneY = canvas.height - 120;
      const hitZoneHeight = 60;
      const hitItem = state.items.find(item => item.active && item.lane === lane && item.y + item.height > hitZoneY && item.y < hitZoneY + hitZoneHeight);
      if (hitItem) {
        hitItem.hit();
        state.score += 200 + state.combo * 10;
        state.combo++; state.maxCombo = Math.max(state.combo, state.maxCombo);
        state.judgments.push({ text: 'PERFECT', alpha: 1, x: hitItem.x + hitItem.width/2, y: hitZoneY - 40 });
      } else { state.combo = 0; audioEngine.playHitSound(); }
      return state;
    }
  },
  HACKER: {
    init: (canvas) => ({ items: [], noteData: generateHackerNotes(100), startTime: null, score: 0, combo: 0, maxCombo: 0, nextNoteIndex: 0, gameStarted: false, gameOver: false, judgments: [] }),
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
          item.counted = true; state.combo = 0;
          state.judgments.push({ text: 'ERR_TIMEOUT', alpha: 1, x: item.x + item.width/2, y: canvas.height - 200 });
        }
        return item.active || item.hitEffect > 0;
      });
      state.judgments = state.judgments.filter(j => { j.alpha -= 0.02; j.y -= 1; return j.alpha > 0; });
      if (state.nextNoteIndex >= state.noteData.length && state.items.length === 0) {
        state.gameOver = true;
        audioEngine.stopBGM();
      }
      return state;
    },
    draw: (ctx, state, canvas) => {
      drawHackerBackground(ctx, canvas);
      state.items.forEach(item => item.draw(ctx));
      state.judgments.forEach(j => {
        ctx.fillStyle = `rgba(0, 255, 65, ${j.alpha})`; ctx.font = 'bold 24px monospace'; ctx.textAlign = 'center';
        ctx.fillText(j.text, j.x, j.y);
      });
      drawUI(ctx, state, canvas);
    },
    handleKey: (key, state, canvas) => {
      const lane = HACKER_KEYS.indexOf(key);
      if (lane === -1) return state;
      if (!state.gameStarted) { 
        state.gameStarted = true; state.startTime = performance.now(); 
        audioEngine.init(); 
        audioEngine.startBGM('HACKER');
        return state; 
      }
      const hitZoneY = canvas.height - 120;
      const hitZoneHeight = 60;
      const hitItem = state.items.find(item => item.active && item.lane === lane && item.y + item.height > hitZoneY && item.y < hitZoneY + hitZoneHeight);
      if (hitItem) {
        hitItem.hit();
        state.score += 150 + state.combo * 15;
        state.combo++; state.maxCombo = Math.max(state.combo, state.maxCombo);
        state.judgments.push({ text: 'SUCCESS', alpha: 1, x: hitItem.x + hitItem.width/2, y: hitZoneY - 50 });
      } else { state.combo = 0; audioEngine.playHitSound(); }
      return state;
    }
  },
  HIGHWAY: {
    init: (canvas) => ({ items: [], noteData: generateHighwayNotes(100), startTime: null, score: 0, combo: 0, maxCombo: 0, nextNoteIndex: 0, gameStarted: false, gameOver: false, judgments: [] }),
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
          item.counted = true; state.combo = 0;
          state.judgments.push({ text: 'MISS', alpha: 1, x: canvas.width/2, y: canvas.height * 0.5 });
        }
        return item.active;
      });
      state.judgments = state.judgments.filter(j => { j.alpha -= 0.02; j.y -= 1; return j.alpha > 0; });
      if (state.nextNoteIndex >= state.noteData.length && state.items.length === 0) {
        state.gameOver = true;
        audioEngine.stopBGM();
      }
      return state;
    },
    draw: (ctx, state, canvas) => {
      drawHighwayBackground(ctx, canvas);
      state.items.forEach(item => item.draw(ctx, canvas));
      state.judgments.forEach(j => {
        ctx.fillStyle = `rgba(0, 255, 255, ${j.alpha})`; ctx.font = 'bold 32px "Orbitron", sans-serif'; ctx.textAlign = 'center';
        ctx.fillText(j.text, j.x, j.y);
      });
      drawUI(ctx, state, canvas);
    },
    handleKey: (key, state, canvas) => {
      const lane = HIGHWAY_KEYS.indexOf(key);
      if (lane === -1) return state;
      if (!state.gameStarted) { 
        state.gameStarted = true; state.startTime = performance.now(); 
        audioEngine.init(); 
        audioEngine.startBGM('HIGHWAY');
        return state; 
      }
      const hitItem = state.items.find(item => item.active && item.lane === lane && item.z > 0.8 && item.z < 1.15);
      if (hitItem) {
        hitItem.hit();
        state.score += 200 + state.combo * 20;
        state.combo++; state.maxCombo = Math.max(state.combo, state.maxCombo);
        state.judgments.push({ text: 'PERFECT', alpha: 1, x: canvas.width/2, y: canvas.height * 0.5 });
      } else { state.combo = 0; audioEngine.playHitSound(); }
      return state;
    }
  },
  SAMURAI: {
    init: (canvas) => ({ items: [], noteData: generateSamuraiNotes(60), startTime: null, score: 0, combo: 0, maxCombo: 0, nextNoteIndex: 0, gameStarted: false, gameOver: false, judgments: [] }),
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
          item.counted = true; state.combo = 0;
          state.judgments.push({ text: 'MISS', alpha: 1, x: item.x + item.width/2, y: canvas.height * 0.5 });
        }
        return item.active || item.sliced;
      });
      state.judgments = state.judgments.filter(j => { j.alpha -= 0.02; j.y -= 1; return j.alpha > 0; });
      if (state.nextNoteIndex >= state.noteData.length && state.items.length === 0) {
        state.gameOver = true;
        audioEngine.stopBGM();
      }
      return state;
    },
    draw: (ctx, state, canvas) => {
      drawSamuraiBackground(ctx, canvas);
      state.items.forEach(item => item.draw(ctx));
      state.judgments.forEach(j => {
        ctx.fillStyle = `rgba(255, 77, 77, ${j.alpha})`; ctx.font = 'bold 32px serif'; ctx.textAlign = 'center';
        ctx.fillText(j.text, j.x, j.y);
      });
      drawUI(ctx, state, canvas);
    },
    handleKey: (key, state, canvas) => {
      const lane = SAMURAI_KEYS.indexOf(key);
      if (lane === -1) return state;
      if (!state.gameStarted) { 
        state.gameStarted = true; state.startTime = performance.now(); 
        audioEngine.init(); 
        audioEngine.startBGM('SAMURAI');
        return state; 
      }
      const hitY = canvas.height * 0.75;
      const hitHeight = 60;
      const hitItem = state.items.find(item => item.active && item.lane === lane && item.y + item.height > hitY && item.y < hitY + hitHeight);
      if (hitItem) {
        hitItem.hit();
        state.score += 300 + state.combo * 30;
        state.combo++; state.maxCombo = Math.max(state.combo, state.maxCombo);
        state.judgments.push({ text: 'SLASH!', alpha: 1, x: hitItem.x + hitItem.width/2, y: canvas.height * 0.5 });
      } else { state.combo = 0; audioEngine.playHitSound(); }
      return state;
    }
  }
};

function drawUI(ctx, state, canvas) {
  ctx.fillStyle = '#00ffff'; ctx.font = 'bold 24px "Orbitron", sans-serif'; ctx.textAlign = 'left';
  ctx.shadowBlur = 10; ctx.shadowColor = '#00ffff';
  ctx.fillText(`SCORE: ${state.score}`, 20, 40);
  ctx.fillStyle = '#ff00ff'; ctx.shadowColor = '#ff00ff';
  ctx.fillText(`COMBO: ${state.combo}`, 20, 80);
  ctx.shadowBlur = 0;

  if (state.gameOver) {
    ctx.fillStyle = 'rgba(5, 5, 16, 0.9)'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#ff00ff'; ctx.textAlign = 'center'; ctx.font = '36px "Press Start 2P", cursive';
    ctx.shadowBlur = 20; ctx.shadowColor = '#ff00ff';
    ctx.fillText('STAGE CLEAR', canvas.width / 2, canvas.height / 2 - 40);
    ctx.fillStyle = '#00ffff'; ctx.shadowColor = '#00ffff'; ctx.font = '24px "Press Start 2P", cursive';
    ctx.fillText(`FINAL SCORE: ${state.score}`, canvas.width / 2, canvas.height / 2 + 40);
    ctx.fillText(`MAX COMBO: ${state.maxCombo}`, canvas.width / 2, canvas.height / 2 + 90);
    ctx.shadowBlur = 0;
  }

  if (!state.gameStarted) {
    ctx.fillStyle = 'rgba(5, 5, 16, 0.8)'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#00ffff'; ctx.font = 'bold 28px "Orbitron", sans-serif'; ctx.textAlign = 'center';
    ctx.shadowBlur = 15; ctx.shadowColor = '#00ffff';
    let msg = 'READY?';
    if (state.mode === 'RAIN') msg = 'KEYS: D F J K';
    if (state.mode === 'HACKER') msg = 'KEYS: A S K L';
    if (state.mode === 'HIGHWAY') msg = 'KEYS: 1 2 3 4';
    if (state.mode === 'SAMURAI') msg = 'KEYS: F J';
    ctx.fillText(msg, canvas.width / 2, canvas.height / 2);
    ctx.font = 'bold 20px "Orbitron", sans-serif';
    ctx.fillText('PRESS ANY KEY TO START', canvas.width / 2, canvas.height / 2 + 60);
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
    
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      const gameLoop = () => {
        stateRef.current = strategy.update(ctx, stateRef.current, canvas);
        strategy.draw(ctx, stateRef.current, canvas);
        rafRef.current = requestAnimationFrame(gameLoop);
      };
      rafRef.current = requestAnimationFrame(gameLoop);
    }
    
    return () => { 
      window.removeEventListener('keydown', handleKeyDown); 
      cancelAnimationFrame(rafRef.current);
      audioEngine.stopBGM();
    };
  }, [mode, handleKeyDown]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen relative p-0 md:p-4 w-full overflow-hidden bg-[#050510]">
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-fuchsia-900/10 to-transparent pointer-events-none" />
      <div className="w-full flex flex-col items-center">
        <div className="game-container w-full max-w-full neon-border bg-[#050510] md:rounded-xl overflow-hidden shadow-2xl">
          <canvas ref={canvasRef} width={800} height={600} className="block w-full h-auto" />
        </div>
        <button onClick={onBack} className="mt-6 mb-4 px-10 py-4 bg-transparent border-2 border-cyan-400 text-cyan-400 font-bold font-mono tracking-widest rounded hover:bg-cyan-400/20 hover:shadow-[0_0_15px_rgba(0,255,255,0.5)] transition-all uppercase text-sm md:text-base">
          [ ABORT MISSION ]
        </button>
      </div>
    </div>
  );
}
