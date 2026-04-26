import { useState, useEffect } from 'react';
import Lobby from './Lobby.jsx';
import GameEngine from './GameEngine.jsx';

const GAME_STATES = {
  LOBBY: 'LOBBY',
  PLAYING: 'PLAYING'
};

const MODES = ['RAIN', 'HACKER', 'HIGHWAY', 'SAMURAI'];

export default function App() {
  const [gameState, setGameState] = useState(GAME_STATES.LOBBY);
  const [selectedMode, setSelectedMode] = useState(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (gameState === GAME_STATES.LOBBY && e.key.toLowerCase() === 'enter') {
        setSelectedMode('RAIN');
        setGameState(GAME_STATES.PLAYING);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState]);

  const handleSelectMode = (mode) => {
    setSelectedMode(mode);
    setGameState(GAME_STATES.PLAYING);
  };

  const handleBack = () => {
    setGameState(GAME_STATES.LOBBY);
    setSelectedMode(null);
  };

  return (
    <div className="min-h-screen">
      {gameState === GAME_STATES.LOBBY && (
        <Lobby onSelectMode={handleSelectMode} />
      )}
      {gameState === GAME_STATES.PLAYING && selectedMode && (
        <GameEngine mode={selectedMode} onBack={handleBack} />
      )}
    </div>
  );
}