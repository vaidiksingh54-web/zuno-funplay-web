import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Trophy, RotateCcw, Volume2, Users, Flame, Star, Zap, Award } from 'lucide-react';
import { soundManager } from '../../utils/soundEffects';

const GRID_SIZE = 8;
const GEMS = [
  { id: 'strawberry', icon: '🍓', color: 'bg-rose-500', name: 'Strawberry' },
  { id: 'lemon', icon: '🍋', color: 'bg-amber-400', name: 'Lemon' },
  { id: 'grape', icon: '🍇', color: 'bg-purple-500', name: 'Grape' },
  { id: 'diamond', icon: '💎', color: 'bg-cyan-400', name: 'Diamond' },
  { id: 'orange', icon: '🍊', color: 'bg-orange-500', name: 'Orange' },
  { id: 'apple', icon: '🍏', color: 'bg-emerald-500', name: 'Apple' },
];

function getRandomGem() {
  return GEMS[Math.floor(Math.random() * GEMS.length)].id;
}

function createInitialBoard() {
  const board = [];
  for (let r = 0; r < GRID_SIZE; r++) {
    const row = [];
    for (let c = 0; c < GRID_SIZE; c++) {
      let gem;
      do {
        gem = getRandomGem();
      } while (
        (c >= 2 && row[c - 1] === gem && row[c - 2] === gem) ||
        (r >= 2 && board[r - 1][c] === gem && board[r - 2][c] === gem)
      );
      row.push(gem);
    }
    board.push(row);
  }
  return board;
}

export default function ColorCrush({ onProfileUpdate }) {
  const [board, setBoard] = useState(createInitialBoard);
  const [selectedTile, setSelectedTile] = useState(null); // { r, c }
  const [score, setScore] = useState(0);
  const [movesLeft, setMovesLeft] = useState(25);
  const [combo, setCombo] = useState(0);
  const [targetScore, setTargetScore] = useState(2000);
  const [gameOver, setGameOver] = useState(false);
  const [isWon, setIsWon] = useState(false);
  const [mode, setMode] = useState('solo'); // 'solo' or 'pvp'
  const [turn, setTurn] = useState(1); // Player 1 or 2
  const [p1Score, setP1Score] = useState(0);
  const [p2Score, setP2Score] = useState(0);
  const [p1Moves, setP1Moves] = useState(15);
  const [p2Moves, setP2Moves] = useState(15);
  const [floatingTexts, setFloatingTexts] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Check for matches on board
  const findMatches = (currentBoard) => {
    const matched = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(false));
    let hasMatch = false;

    // Horizontal check
    for (let r = 0; r < GRID_SIZE; r++) {
      let count = 1;
      for (let c = 1; c <= GRID_SIZE; c++) {
        if (c < GRID_SIZE && currentBoard[r][c] && currentBoard[r][c] === currentBoard[r][c - 1]) {
          count++;
        } else {
          if (count >= 3) {
            hasMatch = true;
            for (let i = c - count; i < c; i++) {
              matched[r][i] = true;
            }
          }
          count = 1;
        }
      }
    }

    // Vertical check
    for (let c = 0; c < GRID_SIZE; c++) {
      let count = 1;
      for (let r = 1; r <= GRID_SIZE; r++) {
        if (r < GRID_SIZE && currentBoard[r][c] && currentBoard[r][c] === currentBoard[r - 1][c]) {
          count++;
        } else {
          if (count >= 3) {
            hasMatch = true;
            for (let i = r - count; i < r; i++) {
              matched[i][c] = true;
            }
          }
          count = 1;
        }
      }
    }

    return { hasMatch, matched };
  };

  // Handle tile click
  const handleTileClick = (r, c) => {
    if (gameOver || isProcessing) return;

    if (!selectedTile) {
      soundManager.playClick();
      setSelectedTile({ r, c });
      return;
    }

    const { r: sr, c: sc } = selectedTile;

    // Same tile clicked -> deselect
    if (sr === r && sc === c) {
      setSelectedTile(null);
      return;
    }

    // Check if adjacent (not diagonal)
    const isAdjacent = Math.abs(sr - r) + Math.abs(sc - c) === 1;
    if (!isAdjacent) {
      soundManager.playClick();
      setSelectedTile({ r, c });
      return;
    }

    // Attempt swap
    swapAndResolve(sr, sc, r, c);
  };

  const swapAndResolve = async (r1, c1, r2, c2) => {
    setIsProcessing(true);
    setSelectedTile(null);

    // Create swapped board
    const newBoard = board.map(row => [...row]);
    const temp = newBoard[r1][c1];
    newBoard[r1][c1] = newBoard[r2][c2];
    newBoard[r2][c2] = temp;

    const { hasMatch } = findMatches(newBoard);

    if (!hasMatch) {
      // Invalid move -> shake & swap back
      soundManager.playTone(200, 0.15, 'triangle');
      setBoard(newBoard);
      setTimeout(() => {
        const revertBoard = newBoard.map(row => [...row]);
        revertBoard[r2][c2] = revertBoard[r1][c1];
        revertBoard[r1][c1] = temp;
        setBoard(revertBoard);
        setIsProcessing(false);
      }, 250);
      return;
    }

    // Valid move -> update moves
    soundManager.playPop();
    let currentBoard = newBoard;
    let currentCombo = 1;
    let earnedPointsTotal = 0;

    // Process cascade
    while (true) {
      const matchResult = findMatches(currentBoard);
      if (!matchResult.hasMatch) break;

      // Count cleared tiles
      let clearedCount = 0;
      const afterClear = currentBoard.map(row => [...row]);
      for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
          if (matchResult.matched[r][c]) {
            clearedCount++;
            afterClear[r][c] = null;
          }
        }
      }

      const points = clearedCount * 60 * currentCombo;
      earnedPointsTotal += points;

      // Sound & floating text
      soundManager.playTone(320 + currentCombo * 80, 0.12, 'sine');
      addFloatingText(`+${points}! Combo x${currentCombo}`, r2, c2);

      // Apply gravity: tiles fall down
      for (let c = 0; c < GRID_SIZE; c++) {
        let emptyRow = GRID_SIZE - 1;
        for (let r = GRID_SIZE - 1; r >= 0; r--) {
          if (afterClear[r][c] !== null) {
            afterClear[emptyRow][c] = afterClear[r][c];
            if (emptyRow !== r) afterClear[r][c] = null;
            emptyRow--;
          }
        }
        // Fill top empty spaces with new gems
        for (let r = emptyRow; r >= 0; r--) {
          afterClear[r][c] = getRandomGem();
        }
      }

      currentBoard = afterClear;
      setBoard([...currentBoard]);
      currentCombo++;
      await new Promise(res => setTimeout(res, 260));
    }

    setCombo(currentCombo - 1);

    // Update game scores based on mode
    if (mode === 'solo') {
      const newScore = score + earnedPointsTotal;
      const newMoves = movesLeft - 1;
      setScore(newScore);
      setMovesLeft(newMoves);

      if (newScore >= targetScore) {
        setIsWon(true);
        setGameOver(true);
        soundManager.playLevelUp();
        if (onProfileUpdate) onProfileUpdate(prev => ({ ...prev, xp: prev.xp + 150, coins: prev.coins + 50 }));
      } else if (newMoves <= 0) {
        setGameOver(true);
        setIsWon(false);
        soundManager.playGameOver();
      }
    } else {
      // PVP Duel mode
      if (turn === 1) {
        const nextScore = p1Score + earnedPointsTotal;
        const nextMoves = p1Moves - 1;
        setP1Score(nextScore);
        setP1Moves(nextMoves);
        if (nextMoves <= 0 && p2Moves <= 0) {
          setGameOver(true);
        } else {
          setTurn(2);
        }
      } else {
        const nextScore = p2Score + earnedPointsTotal;
        const nextMoves = p2Moves - 1;
        setP2Score(nextScore);
        setP2Moves(nextMoves);
        if (p1Moves <= 0 && nextMoves <= 0) {
          setGameOver(true);
        } else {
          setTurn(1);
        }
      }
    }

    setIsProcessing(false);
  };

  const addFloatingText = (text, r, c) => {
    const id = Date.now() + Math.random();
    setFloatingTexts(prev => [...prev, { id, text, r, c }]);
    setTimeout(() => {
      setFloatingTexts(prev => prev.filter(t => t.id !== id));
    }, 900);
  };

  const resetGame = () => {
    soundManager.playPop();
    setBoard(createInitialBoard());
    setSelectedTile(null);
    setScore(0);
    setMovesLeft(25);
    setCombo(0);
    setGameOver(false);
    setIsWon(false);
    setP1Score(0);
    setP2Score(0);
    setP1Moves(15);
    setP2Moves(15);
    setTurn(1);
  };

  const getGemInfo = (id) => GEMS.find(g => g.id === id) || GEMS[0];

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-4 sm:p-6 shadow-sm max-w-4xl mx-auto">
      
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-bold mb-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Match-3 Cascade Puzzle</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading">
            Color Crush Saga
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Swap adjacent candies to create lines of 3 or more! Trigger multi-combos.
          </p>
        </div>

        {/* Mode Selector */}
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-2xl">
          <button
            onClick={() => { setMode('solo'); resetGame(); }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              mode === 'solo' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            Solo Campaign
          </button>
          <button
            onClick={() => { setMode('pvp'); resetGame(); }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
              mode === 'pvp' ? 'bg-amber-400 text-slate-950 shadow-xs' : 'text-slate-600'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>2P Duel</span>
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4">
        {mode === 'solo' ? (
          <>
            <div className="bg-amber-50 p-3 rounded-2xl border border-amber-100 text-center">
              <span className="text-[10px] uppercase font-black tracking-wider text-amber-700">Score</span>
              <div className="text-2xl font-black text-amber-950 font-heading">{score}</div>
            </div>
            <div className="bg-blue-50 p-3 rounded-2xl border border-blue-100 text-center">
              <span className="text-[10px] uppercase font-black tracking-wider text-blue-700">Target</span>
              <div className="text-2xl font-black text-blue-950 font-heading">{targetScore}</div>
            </div>
            <div className="bg-rose-50 p-3 rounded-2xl border border-rose-100 text-center">
              <span className="text-[10px] uppercase font-black tracking-wider text-rose-700">Moves Left</span>
              <div className="text-2xl font-black text-rose-950 font-heading">{movesLeft}</div>
            </div>
            <div className="bg-purple-50 p-3 rounded-2xl border border-purple-100 text-center">
              <span className="text-[10px] uppercase font-black tracking-wider text-purple-700">Max Combo</span>
              <div className="text-2xl font-black text-purple-950 font-heading">x{combo || 1} 🔥</div>
            </div>
          </>
        ) : (
          <>
            <div className={`p-3 rounded-2xl border text-center transition-all ${
              turn === 1 ? 'bg-blue-500 text-white ring-2 ring-blue-300' : 'bg-slate-50 border-slate-200'
            }`}>
              <span className="text-[10px] uppercase font-black tracking-wider">Player 1 (Blue)</span>
              <div className="text-xl font-black font-heading">{p1Score} pts ({p1Moves} moves)</div>
            </div>
            <div className={`p-3 rounded-2xl border text-center transition-all ${
              turn === 2 ? 'bg-rose-500 text-white ring-2 ring-rose-300' : 'bg-slate-50 border-slate-200'
            }`}>
              <span className="text-[10px] uppercase font-black tracking-wider">Player 2 (Red)</span>
              <div className="text-xl font-black font-heading">{p2Score} pts ({p2Moves} moves)</div>
            </div>
            <div className="bg-amber-50 p-3 rounded-2xl border border-amber-100 text-center col-span-2 flex items-center justify-center">
              <span className="text-xs font-black text-amber-900">
                👉 Turn: <span className="font-extrabold underline">{turn === 1 ? 'Player 1' : 'Player 2'}</span>
              </span>
            </div>
          </>
        )}
      </div>

      {/* Main Board Container */}
      <div className="relative mx-auto w-full max-w-md aspect-square bg-slate-900 p-2 sm:p-3 rounded-3xl shadow-xl border-4 border-slate-800">
        
        {/* Tiles Grid */}
        <div className="grid grid-cols-8 grid-rows-8 gap-1.5 h-full w-full">
          {board.map((row, r) =>
            row.map((gemId, c) => {
              const gem = getGemInfo(gemId);
              const isSelected = selectedTile?.r === r && selectedTile?.c === c;
              return (
                <button
                  key={`${r}-${c}`}
                  onClick={() => handleTileClick(r, c)}
                  className={`relative rounded-xl flex items-center justify-center text-xl sm:text-2xl transition-all duration-150 select-none shadow-sm ${
                    isSelected
                      ? 'scale-115 ring-4 ring-amber-300 z-10 animate-bounce'
                      : 'hover:scale-105 active:scale-95'
                  } ${gem.color} bg-opacity-90 hover:bg-opacity-100`}
                >
                  <span className="drop-shadow-md">{gem.icon}</span>
                </button>
              );
            })
          )}
        </div>

        {/* Floating Scores Overlay */}
        {floatingTexts.map(item => (
          <div
            key={item.id}
            className="absolute pointer-events-none text-xs sm:text-sm font-black text-yellow-300 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] animate-float-up z-20"
            style={{
              top: `${(item.r / GRID_SIZE) * 100}%`,
              left: `${(item.c / GRID_SIZE) * 100}%`,
            }}
          >
            {item.text}
          </div>
        ))}

        {/* Game Over Modal Overlay */}
        {gameOver && (
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm rounded-3xl flex flex-col items-center justify-center p-6 text-center z-30 animate-scale-in">
            {mode === 'solo' ? (
              isWon ? (
                <>
                  <div className="w-16 h-16 rounded-full bg-amber-400 flex items-center justify-center text-3xl mb-3 shadow-lg">
                    🎉
                  </div>
                  <h3 className="text-2xl font-black text-white font-heading">Level Complete!</h3>
                  <p className="text-sm text-slate-300 mt-1 mb-4">
                    Score: <span className="font-bold text-amber-300">{score}</span> / {targetScore}
                  </p>
                  <button
                    onClick={resetGame}
                    className="btn-fun px-6 py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-2xl text-sm shadow-md"
                  >
                    Play Again
                  </button>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 rounded-full bg-rose-500/80 flex items-center justify-center text-3xl mb-3">
                    💔
                  </div>
                  <h3 className="text-2xl font-black text-white font-heading">Out of Moves!</h3>
                  <p className="text-sm text-slate-300 mt-1 mb-4">
                    Reached {score} points. Target was {targetScore}.
                  </p>
                  <button
                    onClick={resetGame}
                    className="px-6 py-3 bg-white hover:bg-slate-100 text-slate-900 font-black rounded-2xl text-sm shadow-md"
                  >
                    Try Again
                  </button>
                </>
              )
            ) : (
              <>
                <div className="w-16 h-16 rounded-full bg-amber-400 flex items-center justify-center text-3xl mb-3 shadow-lg">
                  🏆
                </div>
                <h3 className="text-2xl font-black text-white font-heading">
                  {p1Score > p2Score ? '🎉 Player 1 Wins!' : p2Score > p1Score ? '🎉 Player 2 Wins!' : '🤝 It is a Tie!'}
                </h3>
                <p className="text-sm text-slate-300 mt-1 mb-4">
                  P1: {p1Score} pts | P2: {p2Score} pts
                </p>
                <button
                  onClick={resetGame}
                  className="btn-fun px-6 py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-2xl text-sm shadow-md"
                >
                  Rematch Duel
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Footer Controls & Instructions */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 font-medium">
        <div className="flex items-center gap-2">
          <span>💡 Tap two adjacent fruits or gems to swap them and create 3+ in a row.</span>
        </div>
        <button
          onClick={resetGame}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>New Game</span>
        </button>
      </div>

    </div>
  );
}
