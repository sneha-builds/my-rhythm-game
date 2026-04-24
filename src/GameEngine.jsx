import { useEffect, useRef, useCallback } from 'react';
import audioEngine from './AudioEngine.js';
import {
  Raindrop,
  generateNoteData,
  drawRainBackground,
  drawRipple,
  getLaneFromKey,
  LANE_POSITIONS
} from './modes/RainLogic.js';

const MODE_STRATEGIES = {
  RAIN: {
    init: (canvas) => {
      return {
        drops: [],
        noteData: generateNoteData(50, 4),
        startTime: null,
        score: 0,
        combo: 0,
        maxCombo: 0,
        nextNoteIndex: 0,
        gameStarted: false,
        gameOver: false,
        laneEffects: [false, false, false, false]
      };
    },
    update: (ctx, state, canvas, isDark) => {
      if (!state.gameStarted || state.gameOver) return state;
      
      const elapsed = performance.now() - state.startTime;
      
      while (
        state.nextNoteIndex < state.noteData.length &&
        state.noteData[state.nextNoteIndex].time < elapsed
      ) {
        const note = state.noteData[state.nextNoteIndex];
        const drop = new Raindrop(canvas, note.lane);
        state.drops.push(drop);
        state.nextNoteIndex++;
      }
      
      state.drops = state.drops.filter(drop => {
        drop.update();
        return drop.active || drop.missed;
      });
      
      const missedNow = state.drops.filter(d => d.missed && !d.counted);
      if (missedNow.length > 0) {
        missedNow.forEach(d => {
          d.counted = true;
          state.combo = 0;
          audioEngine.playHitSound();
        });
      }
      
      state.laneEffects = state.laneEffects.map(val => val ? Math.max(0, val - 0.1) : val);
      
      return state;
    },
    draw: (ctx, state, canvas, isDark) => {
      drawRainBackground(ctx, canvas, isDark);
      
      state.drops.forEach(drop => drop.draw(ctx));
      
      state.drops.forEach(drop => {
        if (drop.ripple) {
          drawRipple(drop.ripple, ctx);
        }
      });
      
      ctx.fillStyle = isDark ? '#f1f5f9' : '#1e293b';
      ctx.font = 'bold 20px system-ui';
      ctx.textAlign = 'left';
      ctx.fillText(`Score: ${state.score}`, 20, 35);
      ctx.fillText(`Combo: ${state.combo}`, 20, 65);
      
      if (state.gameOver) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 48px system-ui';
        ctx.textAlign = 'center';
        ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 20);
        ctx.font = '24px system-ui';
        ctx.fillText(`Final Score: ${state.score}`, canvas.width / 2, canvas.height / 2 + 30);
        ctx.fillText(`Max Combo: ${state.maxCombo}`, canvas.width / 2, canvas.height / 2 + 65);
      }
      
      if (!state.gameStarted) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 32px system-ui';
        ctx.textAlign = 'center';
        ctx.fillText('Press D, F, J, or K to Start', canvas.width / 2, canvas.height / 2);
      }
    },
    handleKey: (key, state) => {
      const lane = getLaneFromKey(key);
      if (lane === null) return state;
      
      state.laneEffects[lane] = 1;
      
      if (!state.gameStarted) {
        if (lane !== null) {
          state.gameStarted = true;
          state.startTime = performance.now();
          audioEngine.init();
          audioEngine.resume();
        }
        return state;
      }
      
      console.log('Key pressed:', key, 'Lane:', lane);
      return state;
    }
  },
  HACKER: {
    init: () => ({ message: 'Hacker Mode - Coming Soon' }),
    draw: (ctx, canvas, isDark) => {
      ctx.fillStyle = isDark ? '#0f172a' : '#f8fafc';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = isDark ? '#f1f5f9' : '#1e293b';
      ctx.font = 'bold 32px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText('Hacker Mode', canvas.width / 2, canvas.height / 2 - 20);
      ctx.font = '18px system-ui';
      ctx.fillText('Coming Soon', canvas.width / 2, canvas.height / 2 + 25);
    },
    handleKey: () => {}
  },
  HIGHWAY: {
    init: () => ({ message: 'Highway Mode - Coming Soon' }),
    draw: (ctx, canvas, isDark) => {
      ctx.fillStyle = isDark ? '#0f172a' : '#f8fafc';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = isDark ? '#f1f5f9' : '#1e293b';
      ctx.font = 'bold 32px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText('Neon Highway Mode', canvas.width / 2, canvas.height / 2 - 20);
      ctx.font = '18px system-ui';
      ctx.fillText('Coming Soon', canvas.width / 2, canvas.height / 2 + 25);
    },
    handleKey: () => {}
  },
  SAMURAI: {
    init: () => ({ message: 'Samurai Mode - Coming Soon' }),
    draw: (ctx, canvas, isDark) => {
      ctx.fillStyle = isDark ? '#0f172a' : '#f8fafc';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = isDark ? '#f1f5f9' : '#1e293b';
      ctx.font = 'bold 32px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText('Samurai Slash Mode', canvas.width / 2, canvas.height / 2 - 20);
      ctx.font = '18px system-ui';
      ctx.fillText('Coming Soon', canvas.width / 2, canvas.height / 2 + 25);
    },
    handleKey: () => {}
  }
};

export default function GameEngine({ mode, onBack }) {
  const canvasRef = useRef(null);
  const stateRef = useRef(null);
  const strategyRef = useRef(null);
  const rafRef = useRef(null);
  const isDarkRef = useRef(false);

  const checkMatch = useCallback((lane) => {
    if (!stateRef.current || !stateRef.current.gameStarted) return;
    
    const state = stateRef.current;
    const threshold = 50;
    const hitY = canvasRef.current.height - 50;
    
    let closestDrop = null;
    let closestDist = Infinity;
    
    state.drops.forEach(drop => {
      if (drop.active && drop.lane === lane) {
        const dist = Math.abs(drop.y - hitY);
        if (dist < closestDist && dist < threshold) {
          closestDist = dist;
          closestDrop = drop;
        }
      }
    });
    
    if (closestDrop) {
      closestDrop.hit();
      state.score += 100 + state.combo * 10;
      state.combo++;
      if (state.combo > state.maxCombo) {
        state.maxCombo = state.combo;
      }
    } else {
      state.combo = 0;
      audioEngine.playHitSound();
    }
  }, []);

  const handleKeyDown = useCallback((e) => {
    const key = e.key.toLowerCase();
    if (strategyRef.current && strategyRef.current.handleKey) {
      const newState = strategyRef.current.handleKey(key, stateRef.current);
      if (newState) {
        stateRef.current = newState;
      }
    }
    
    checkMatch(getLaneFromKey(key));
  }, [checkMatch]);

  useEffect(() => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    isDarkRef.current = prefersDark;
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      isDarkRef.current = e.matches;
    };
    mediaQuery.addEventListener('change', handleChange);
    
    const strategy = MODE_STRATEGIES[mode] || MODE_STRATEGIES.RAIN;
    strategyRef.current = strategy;
    stateRef.current = strategy.init(canvasRef.current);
    
    window.addEventListener('keydown', handleKeyDown);
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    const gameLoop = () => {
      const isDark = isDarkRef.current;
      
      if (strategyRef.current.update) {
        stateRef.current = strategyRef.current.update(
          ctx,
          stateRef.current,
          canvas,
          isDark
        );
      }
      
      if (strategyRef.current.draw) {
        strategyRef.current.draw(ctx, stateRef.current, canvas, isDark);
      }
      
      rafRef.current = requestAnimationFrame(gameLoop);
    };
    
    rafRef.current = requestAnimationFrame(gameLoop);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      mediaQuery.removeEventListener('change', handleChange);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [mode, handleKeyDown]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        className="border-2 border-[var(--accent)] rounded-lg"
        style={{ maxWidth: '100%', height: 'auto' }}
      />
      <button
        onClick={onBack}
        className="mt-4 px-6 py-2 bg-[var(--accent)] text-white rounded-lg hover:opacity-90 transition-opacity"
      >
        Back to Lobby
      </button>
    </div>
  );
}