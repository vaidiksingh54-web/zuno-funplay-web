import React, { useState, useEffect, useRef } from 'react';
import { Compass, Trophy, RotateCcw, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, ShieldAlert, Sparkles, Key, DoorOpen } from 'lucide-react';
import { soundManager } from '../../utils/soundEffects';

// Tile definitions:
// 0: Path, 1: Wall, 2: Key, 3: Exit, 4: Coin, 5: Trap
const MAZES = [
  // Level 1: 11x11 Forest Maze
  {
    name: 'Forest Labyrinth',
    theme: 'border-emerald-500 bg-emerald-950',
    grid: [
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 0, 0, 0, 1, 4, 0, 0, 0, 2, 1],
      [1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1],
      [1, 4, 1, 0, 0, 0, 0, 4, 1, 0, 1],
      [1, 0, 1, 1, 1, 1, 0, 0, 1, 0, 1],
      [1, 0, 0, 0, 4, 1, 1, 0, 0, 0, 1],
      [1, 1, 1, 0, 0, 0, 1, 1, 1, 0, 1],
      [1, 4, 0, 0, 1, 0, 0, 4, 1, 0, 1],
      [1, 0, 1, 1, 1, 1, 0, 0, 1, 0, 1],
      [1, 0, 0, 4, 0, 0, 0, 0, 0, 3, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    ],
    start: { r: 1, c: 1 },
  },
  // Level 2: 11x11 Crystal Dungeon with Traps
  {
    name: 'Crystal Cavern',
    theme: 'border-purple-500 bg-purple-950',
    grid: [
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 0, 1, 2, 0, 1, 4, 0, 0, 0, 1],
      [1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 5, 1, 4, 1],
      [1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1],
      [1, 4, 0, 0, 0, 5, 0, 0, 0, 0, 1],
      [1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1],
      [1, 0, 1, 4, 0, 0, 0, 4, 1, 0, 1],
      [1, 0, 1, 0, 1, 1, 1, 0, 1, 5, 1],
      [1, 0, 0, 0, 1, 3, 0, 0, 0, 0, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    ],
    start: { r: 1, c: 1 },
  },
];

export default function MazeEscape({ onProfileUpdate }) {
  const [levelIndex, setLevelIndex] = useState(0);
  const currentMaze = MAZES[levelIndex];
  
  const [playerPos, setPlayerPos] = useState(currentMaze.start);
  const [hasKey, setHasKey] = useState(false);
  const [coinsCollected, setCoinsCollected] = useState(0);
  const [steps, setSteps] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [gameState, setGameState] = useState('playing'); // 'playing', 'won', 'lost'
  const [mode, setMode] = useState('solo'); // 'solo' or 'pvp'
  const [p1Time, setP1Time] = useState(null);
  const [p2Time, setP2Time] = useState(null);
  const [pvpTurn, setPvpTurn] = useState(1);
  const [boardItems, setBoardItems] = useState(() => currentMaze.grid.map(row => [...row]));

  const containerRef = useRef(null);

  // Countdown timer
  useEffect(() => {
    if (gameState !== 'playing') return;
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setGameState('lost');
          soundManager.playGameOver();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [gameState]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (gameState !== 'playing') return;
      if (['ArrowUp', 'KeyW'].includes(e.code)) {
        e.preventDefault();
        movePlayer(-1, 0);
      } else if (['ArrowDown', 'KeyS'].includes(e.code)) {
        e.preventDefault();
        movePlayer(1, 0);
      } else if (['ArrowLeft', 'KeyA'].includes(e.code)) {
        e.preventDefault();
        movePlayer(0, -1);
      } else if (['ArrowRight', 'KeyD'].includes(e.code)) {
        e.preventDefault();
        movePlayer(0, 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [playerPos, gameState, boardItems, hasKey]);

  const movePlayer = (dr, dc) => {
    const nr = playerPos.r + dr;
    const nc = playerPos.c + dc;

    // Bounds check
    if (nr < 0 || nr >= currentMaze.grid.length || nc < 0 || nc >= currentMaze.grid[0].length) return;

    // Wall check
    const tile = boardItems[nr][nc];
    if (tile === 1) {
      soundManager.playTone(150, 0.05, 'sawtooth');
      return;
    }

    // Spike trap check
    if (tile === 5) {
      soundManager.playTone(100, 0.2, 'square');
      setGameState('lost');
      return;
    }

    // Valid move
    soundManager.playTone(400, 0.03, 'sine');
    setSteps(s => s + 1);
    setPlayerPos({ r: nr, c: nc });

    // Item pickups
    if (tile === 2) { // Key
      soundManager.playTone(700, 0.2, 'triangle');
      setHasKey(true);
      updateTile(nr, nc, 0);
    } else if (tile === 4) { // Coin
      soundManager.playTone(550, 0.1, 'sine');
      setCoinsCollected(c => c + 1);
      updateTile(nr, nc, 0);
    } else if (tile === 3) { // Exit Portal
      if (hasKey) {
        soundManager.playLevelUp();
        const timeTaken = 60 - timeLeft;
        if (mode === 'solo') {
          setGameState('won');
          if (onProfileUpdate) {
            onProfileUpdate(prev => ({ ...prev, xp: prev.xp + 100, coins: prev.coins + coinsCollected * 10 }));
          }
        } else {
          // PVP turn handling
          if (pvpTurn === 1) {
            setP1Time(timeTaken);
            setPvpTurn(2);
            resetForNextPlayer();
          } else {
            setP2Time(timeTaken);
            setGameState('won');
          }
        }
      } else {
        // Locked door reminder
        soundManager.playTone(220, 0.15, 'sawtooth');
      }
    }
  };

  const updateTile = (r, c, val) => {
    setBoardItems(prev => {
      const copy = prev.map(row => [...row]);
      copy[r][c] = val;
      return copy;
    });
  };

  const resetForNextPlayer = () => {
    setPlayerPos(currentMaze.start);
    setHasKey(false);
    setCoinsCollected(0);
    setSteps(0);
    setTimeLeft(60);
    setBoardItems(currentMaze.grid.map(row => [...row]));
  };

  const resetGame = () => {
    soundManager.playPop();
    setPlayerPos(currentMaze.start);
    setHasKey(false);
    setCoinsCollected(0);
    setSteps(0);
    setTimeLeft(60);
    setGameState('playing');
    setP1Time(null);
    setP2Time(null);
    setPvpTurn(1);
    setBoardItems(currentMaze.grid.map(row => [...row]));
  };

  const switchLevel = (idx) => {
    soundManager.playPop();
    setLevelIndex(idx);
    const maze = MAZES[idx];
    setPlayerPos(maze.start);
    setHasKey(false);
    setCoinsCollected(0);
    setSteps(0);
    setTimeLeft(60);
    setGameState('playing');
    setBoardItems(maze.grid.map(row => [...row]));
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-4 sm:p-6 shadow-sm max-w-4xl mx-auto" ref={containerRef}>
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold mb-1">
            <Compass className="w-3.5 h-3.5 text-emerald-600" />
            <span>Dungeon Maze Adventure</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading">
            Maze Escape
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Find the Golden Key 🗝️, dodge deadly spikes ⚠️, and escape via the exit portal 🌀!
          </p>
        </div>

        {/* Level & Mode Tabs */}
        <div className="flex items-center gap-2">
          {MAZES.map((m, idx) => (
            <button
              key={m.name}
              onClick={() => switchLevel(idx)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                levelIndex === idx ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Lvl {idx + 1}
            </button>
          ))}
          <button
            onClick={() => { setMode(m => m === 'solo' ? 'pvp' : 'solo'); resetGame(); }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              mode === 'pvp' ? 'bg-amber-400 text-slate-950' : 'bg-slate-100 text-slate-600'
            }`}
          >
            {mode === 'pvp' ? '2P Time Attack' : 'Solo Mode'}
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4">
        <div className="bg-emerald-50 p-3 rounded-2xl border border-emerald-100 text-center">
          <span className="text-[10px] uppercase font-black tracking-wider text-emerald-700">Time Left</span>
          <div className={`text-2xl font-black font-heading ${timeLeft <= 15 ? 'text-rose-600 animate-pulse' : 'text-emerald-950'}`}>
            {timeLeft}s
          </div>
        </div>
        <div className="bg-amber-50 p-3 rounded-2xl border border-amber-100 text-center">
          <span className="text-[10px] uppercase font-black tracking-wider text-amber-700">Gems / Coins</span>
          <div className="text-2xl font-black text-amber-950 font-heading">💎 {coinsCollected}</div>
        </div>
        <div className="bg-blue-50 p-3 rounded-2xl border border-blue-100 text-center">
          <span className="text-[10px] uppercase font-black tracking-wider text-blue-700">Golden Key</span>
          <div className="text-2xl font-black text-blue-950 font-heading">
            {hasKey ? '🗝️ Found!' : '🔒 Locked'}
          </div>
        </div>
        <div className="bg-purple-50 p-3 rounded-2xl border border-purple-100 text-center">
          <span className="text-[10px] uppercase font-black tracking-wider text-purple-700">Steps Taken</span>
          <div className="text-2xl font-black text-purple-950 font-heading">{steps}</div>
        </div>
      </div>

      {/* Main Maze Canvas / Grid */}
      <div className="relative mx-auto w-full max-w-md aspect-square bg-slate-950 p-3 rounded-3xl shadow-xl border-4 border-slate-800 flex items-center justify-center">
        
        <div className="grid grid-cols-11 grid-rows-11 gap-1 w-full h-full">
          {boardItems.map((row, r) =>
            row.map((tile, c) => {
              const isPlayer = playerPos.r === r && playerPos.c === c;
              
              let tileContent = null;
              let bg = 'bg-slate-900';

              if (tile === 1) {
                bg = 'bg-slate-800 border border-slate-700 rounded-md';
              } else if (tile === 2) {
                tileContent = <span className="animate-bounce text-sm sm:text-base">🗝️</span>;
              } else if (tile === 3) {
                tileContent = (
                  <span className={`text-sm sm:text-base ${hasKey ? 'animate-spin text-emerald-400' : 'opacity-60'}`}>
                    🌀
                  </span>
                );
                bg = hasKey ? 'bg-emerald-900/60 ring-2 ring-emerald-400 rounded-lg' : 'bg-slate-900';
              } else if (tile === 4) {
                tileContent = <span className="text-xs sm:text-sm">💎</span>;
              } else if (tile === 5) {
                tileContent = <span className="text-xs sm:text-sm animate-pulse">⚠️</span>;
                bg = 'bg-rose-950/80';
              }

              return (
                <div
                  key={`${r}-${c}`}
                  className={`relative rounded-md flex items-center justify-center select-none ${bg}`}
                >
                  {isPlayer ? (
                    <span className="text-lg sm:text-2xl z-10 animate-bounce drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]">
                      🦊
                    </span>
                  ) : (
                    tileContent
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Modal Overlay for Win / Loss */}
        {gameState !== 'playing' && (
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm rounded-3xl flex flex-col items-center justify-center p-6 text-center z-20 animate-scale-in">
            {gameState === 'won' ? (
              <>
                <div className="w-16 h-16 rounded-full bg-emerald-400 flex items-center justify-center text-3xl mb-3 shadow-lg">
                  🏆
                </div>
                <h3 className="text-2xl font-black text-white font-heading">
                  {mode === 'solo' ? 'Maze Escaped!' : p1Time < p2Time ? 'Player 1 Wins!' : 'Player 2 Wins!'}
                </h3>
                <p className="text-sm text-slate-300 mt-1 mb-4">
                  {mode === 'solo'
                    ? `Time: ${60 - timeLeft}s | Steps: ${steps} | Gems: ${coinsCollected}`
                    : `P1: ${p1Time}s vs P2: ${p2Time}s`}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={resetGame}
                    className="btn-fun px-6 py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-2xl text-sm"
                  >
                    Play Again
                  </button>
                  {levelIndex < MAZES.length - 1 && (
                    <button
                      onClick={() => switchLevel(levelIndex + 1)}
                      className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-white font-black rounded-2xl text-sm"
                    >
                      Next Level
                    </button>
                  )}
                </div>
              </>
            ) : (
              <>
                <div className="w-16 h-16 rounded-full bg-rose-500/80 flex items-center justify-center text-3xl mb-3">
                  💥
                </div>
                <h3 className="text-2xl font-black text-white font-heading">Trap Triggered / Out of Time!</h3>
                <p className="text-sm text-slate-300 mt-1 mb-4">
                  Watch out for spikes ⚠️ and reach the exit before the timer hits 0!
                </p>
                <button
                  onClick={resetGame}
                  className="px-6 py-3 bg-white hover:bg-slate-100 text-slate-900 font-black rounded-2xl text-sm"
                >
                  Retry Maze
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Virtual D-Pad for Mobile */}
      <div className="mt-6 flex flex-col items-center gap-2">
        <button
          onClick={() => movePlayer(-1, 0)}
          className="w-14 h-14 rounded-2xl bg-slate-100 hover:bg-slate-200 active:scale-95 flex items-center justify-center border border-slate-300 shadow-sm text-slate-800"
        >
          <ArrowUp className="w-6 h-6" />
        </button>
        <div className="flex gap-4">
          <button
            onClick={() => movePlayer(0, -1)}
            className="w-14 h-14 rounded-2xl bg-slate-100 hover:bg-slate-200 active:scale-95 flex items-center justify-center border border-slate-300 shadow-sm text-slate-800"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <button
            onClick={() => movePlayer(1, 0)}
            className="w-14 h-14 rounded-2xl bg-slate-100 hover:bg-slate-200 active:scale-95 flex items-center justify-center border border-slate-300 shadow-sm text-slate-800"
          >
            <ArrowDown className="w-6 h-6" />
          </button>
          <button
            onClick={() => movePlayer(0, 1)}
            className="w-14 h-14 rounded-2xl bg-slate-100 hover:bg-slate-200 active:scale-95 flex items-center justify-center border border-slate-300 shadow-sm text-slate-800"
          >
            <ArrowRight className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-500 font-medium">
        <span>🎮 Controls: Use Arrow keys / WASD on keyboard or the on-screen buttons.</span>
        <button
          onClick={resetGame}
          className="flex items-center gap-1 text-slate-700 font-bold hover:text-slate-900"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Restart</span>
        </button>
      </div>

    </div>
  );
}
