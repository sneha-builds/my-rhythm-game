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
    description: 'Decode the matrix - Coming Soon',
    color: 'from-green-500 to-emerald-600',
    icon: '💻',
    available: false
  },
  {
    id: 'HIGHWAY',
    name: 'Neon Highway',
    description: 'Race through endless neon - Coming Soon',
    color: 'from-pink-500 to-rose-600',
    icon: '🛣️',
    available: false
  },
  {
    id: 'SAMURAI',
    name: 'Samurai Slash',
    description: 'Precision cuts - Coming Soon',
    color: 'from-red-500 to-orange-600',
    icon: '⚔️',
    available: false
  }
];

function ModeCard({ mode, onSelect }) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDark(prefersDark);

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => setIsDark(e.matches);
    mediaQuery.addEventListener('change', handleChange);

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return (
    <button
      onClick={() => onSelect(mode.id)}
      disabled={!mode.available}
      className={`
        relative overflow-hidden rounded-2xl p-6 
        transition-all duration-300 transform
        ${mode.available 
          ? 'hover:scale-105 hover:shadow-xl cursor-pointer' 
          : 'opacity-60 cursor-not-allowed'}
        bg-[var(--bg-secondary)]
        text-left w-full min-h-[160px]
      `}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${mode.color} opacity-10`} />
      
      <div className="relative z-10 flex flex-col h-full">
        <div className="text-4xl mb-3">{mode.icon}</div>
        
        <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
          {mode.name}
        </h3>
        
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          {mode.description}
        </p>
        
        {!mode.available && (
          <div className="absolute top-3 right-3 px-2 py-1 bg-[var(--accent)] text-white text-xs rounded-full">
            Soon
          </div>
        )}
      </div>
    </button>
  );
}

export default function Lobby({ onSelectMode }) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDark(prefersDark);

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => setIsDark(e.matches);
    mediaQuery.addEventListener('change', handleChange);

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <h1 
            className="text-4xl md:text-5xl font-bold mb-4"
            style={{ color: 'var(--text-primary)' }}
          >
            Rhythm Game
          </h1>
          <p 
            className="text-lg"
            style={{ color: 'var(--text-secondary)' }}
          >
            Select your game mode
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {MODES.map(mode => (
            <ModeCard 
              key={mode.id} 
              mode={mode} 
              onSelect={onSelectMode}
            />
          ))}
        </div>
        
        <div 
          className="mt-12 text-center text-sm"
          style={{ color: 'var(--text-secondary)' }}
        >
          Press any key (D, F, J, K) to play • Auto-detects system theme
        </div>
      </div>
    </div>
  );
}