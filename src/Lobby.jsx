import { useEffect, useState } from 'react';

const MODES = [
  {
    id: 'RAIN',
    name: 'Rainmaker',
    description: 'Catch falling raindrops in 4 lanes',
    color: 'from-blue-500 to-indigo-600',
    icon: '🌧️',
    available: true
  },
  {
    id: 'HACKER',
    name: 'Cyber Hacker',
    description: 'Decode the matrix - LIVE NOW',
    color: 'from-green-500 to-emerald-600',
    icon: '💻',
    available: true
  },
  {
    id: 'HIGHWAY',
    name: 'Neon Highway',
    description: 'Race through endless neon - LIVE NOW',
    color: 'from-pink-500 to-rose-600',
    icon: '🛣️',
    available: true
  },
  {
    id: 'SAMURAI',
    name: 'Samurai Slash',
    description: 'Precision cuts - LIVE NOW',
    color: 'from-red-500 to-orange-600',
    icon: '⚔️',
    available: true
  }
];

function ModeCard({ mode, onSelect }) {
  return (
    <button
      onClick={() => onSelect(mode.id)}
      disabled={!mode.available}
      className={`
        relative overflow-hidden rounded-xl p-6 
        transition-all duration-300 transform glass-panel
        ${mode.available 
          ? 'hover:scale-105 hover:animate-pulse-glow cursor-pointer neon-border' 
          : 'opacity-50 cursor-not-allowed border border-gray-700'}
        text-left w-full min-h-[180px] group
      `}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${mode.color} opacity-20 group-hover:opacity-40 transition-opacity`} />
      
      <div className="relative z-10 flex flex-col h-full">
        <div className="text-5xl mb-4 filter drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]">{mode.icon}</div>
        
        <h3 className="text-xl font-bold mb-2 text-white tracking-wider">
          {mode.name}
        </h3>
        
        <p className="text-sm text-indigo-300">
          {mode.description}
        </p>
      </div>
    </button>
  );
}

export default function Lobby({ onSelectMode }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/20 via-transparent to-transparent pointer-events-none" />
      
      <div className="max-w-4xl w-full z-10">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-7xl font-black mb-6 neon-text tracking-widest text-fuchsia-500">
            NEON RHYTHM
          </h1>
          <p className="text-xl cyan-neon-text tracking-widest uppercase">
            Select Arcade Mode
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {MODES.map(mode => (
            <ModeCard 
              key={mode.id} 
              mode={mode} 
              onSelect={onSelectMode}
            />
          ))}
        </div>
        
        <div className="mt-16 text-center">
          <div className="inline-block px-6 py-3 glass-panel rounded-full text-indigo-300 text-sm font-mono uppercase tracking-widest">
            Different modes use different keys • Check the start screen
          </div>
        </div>
      </div>
    </div>
  );
}