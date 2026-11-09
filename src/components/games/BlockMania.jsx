import React, { useState } from 'react';
import { Play, RotateCcw, Trophy, Sparkles, Users } from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundManager } from '../../utils/soundEffects';
import { addXPAndCoins } from '../../utils/storage';

const GRID_SIZE = 8;

const SHAPES = [
  { id: 'single', name: '1x1', matrix: [[1]], color: '#ef4444' },
  { id: 'h2', name: '2x1', matrix: [[1, 1]], color: '#f59e0b' },
  { id: 'v2', name: '1x2', matrix: [[1], [1]], color: '#f59e0b' },
  { id: 'h3', name: '3x1', matrix: [[1, 1, 1]], color: '#10b981' },
  { id: 'v3', name: '1x3', matrix: [[1], [1], [1]], color: '#10b981' },
  { id: 'sq2', name: '2x2', matrix: [[1, 1], [1, 1]], color: '#3b82f6' },
  { id: 'l_shape', name: 'L', matrix: [[1, 0], [1, 0], [1, 1]], color: '#8b5cf6' },
  { id: 'corner', name: 'Corner', matrix: [[1, 1], [1, 0]], color: '#ec4899' },
  { id: 't_shape', name: 'T', matrix: [[1, 1, 1], [0, 1, 0]], color: '#06b6d4' },
];

export default function BlockMania({ onProfileUpdate }) {
  const [board, setBoard] = useState(() => Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(null)));
  const [currentShapes, setCurrentShapes] = useState(() => getRandomShapes());
  const [selectedShapeIdx, setSelectedShapeIdx] = useState(null);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(690);
  const [isGameOver, setIsGameOver] = useState(false);
  const [mode, setMode] = useState('single'); // 'single' | 'duel'
  const [activePlayer, setActivePlayer] = useState(1);
  const [scores, setScores] = useState({ p1: 0, p2: 0 });
  const [winnerNotice, setWinnerNotice] = useState('');

  function getRandomShapes() {
    return [
      SHAPES[Math.floor(Math.random() * SHAPES.length)],
      SHAPES[Math.floor(Math.random() * SHAPES.length)],
      SHAPES[Math.floor(Math.random() * SHAPES.length)],
    ];
  }

  const restartGame = () => {
    soundManager.playPop();
    setBoard(Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(null)));
    setCurrentShapes(getRandomShapes());
    setSelectedShapeIdx(null);
    setScore(0);
    setIsGameOver(false);
    setWinnerNotice('');
    setScores({ p1: 0, p2: 0 });
  };

  const canPlace = (grid, shape, startR, startC) => {
    const mat = shape.matrix;
    for (let r = 0; r < mat.length; r++) {
      for (let c = 0; c < mat[r].length; c++) {
        if (mat[r][c]) {
          const br = startR + r;
          const bc = startC + c;
          if (br >= GRID_SIZE || bc >= GRID_SIZE || grid[br][bc] !== null) {
            return false;
          }
        }
      }
    }
    return true;
  };

  const handleCellClick = (r, c) => {
    if (selectedShapeIdx === null || isGameOver) return;
    const shape = currentShapes[selectedShapeIdx];
    if (!shape) return;

    if (!canPlace(board, shape, r, c)) {
      soundManager.playLoss();
      return;
    }

    soundManager.playClick();

    // Place the shape
    const newBoard = board.map(row => [...row]);
    const mat = shape.matrix;
    let placedBlocks = 0;

    for (let sr = 0; sr < mat.length; sr++) {
      for (let sc = 0; sc < mat[sr].length; sc++) {
        if (mat[sr][sc]) {
          newBoard[r + sr][c + sc] = shape.color;
          placedBlocks++;
        }
      }
    }

    // Check complete rows and columns
    const rowsToClear = [];
    const colsToClear = [];

    for (let i = 0; i < GRID_SIZE; i++) {
      if (newBoard[i].every(cell => cell !== null)) rowsToClear.push(i);
      if (newBoard.every(row => row[i] !== null)) colsToClear.push(i);
    }

    let clearedLines = rowsToClear.length + colsToClear.length;
    if (clearedLines > 0) {
      soundManager.playClearLine();
      rowsToClear.forEach(ri => {
        for (let ci = 0; ci < GRID_SIZE; ci++) newBoard[ri][ci] = null;
      });
      colsToClear.forEach(ci => {
        for (let ri = 0; ri < GRID_SIZE; ri++) newBoard[ri][ci] = null;
      });
    }

    const earned = placedBlocks * 10 + clearedLines * 100 * (clearedLines > 1 ? 1.5 : 1);
    const newScore = score + Math.round(earned);
    setScore(newScore);
    if (newScore > highScore) setHighScore(newScore);

    if (mode === 'duel') {
      setScores(prev => ({
        ...prev,
        [activePlayer === 1 ? 'p1' : 'p2']: prev[activePlayer === 1 ? 'p1' : 'p2'] + Math.round(earned),
      }));
    }

    setBoard(newBoard);

    // Consume placed shape
    const nextShapes = [...currentShapes];
    nextShapes[selectedShapeIdx] = null;
    setSelectedShapeIdx(null);

    // If all 3 used, generate 3 more
    if (nextShapes.every(s => s === null)) {
      const refreshed = getRandomShapes();
      setCurrentShapes(refreshed);
      checkGameOver(newBoard, refreshed);
    } else {
      setCurrentShapes(nextShapes);
      checkGameOver(newBoard, nextShapes);
    }
  };

  const checkGameOver = (grid, shapes) => {
    const activeRemaining = shapes.filter(s => s !== null);
    let anyFits = false;

    for (const shape of activeRemaining) {
      for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
          if (canPlace(grid, shape, r, c)) {
            anyFits = true;
            break;
          }
        }
        if (anyFits) break;
      }
      if (anyFits) break;
    }

    if (!anyFits && activeRemaining.length > 0) {
      setIsGameOver(true);
      soundManager.playLoss();

      if (mode === 'duel') {
        if (activePlayer === 1) {
          setActivePlayer(2);
          setWinnerNotice(`Player 1 finished with ${scores.p1}! Player 2's turn!`);
        } else {
          const p1 = scores.p1;
          const p2 = scores.p2;
          if (p1 > p2) setWinnerNotice(`Player 1 Wins (${p1} vs ${p2})! 🏆`);
          else if (p2 > p1) setWinnerNotice(`Player 2 Wins (${p2} vs ${p1})! 🏆`);
          else setWinnerNotice(`Tie Game (${p1} each)! 🤝`);
          soundManager.playWin();
          confetti({ particleCount: 80, spread: 60 });
        }
      } else {
        setWinnerNotice(`Game Over! Final Score: ${score}`);
        soundManager.playWin();
        confetti({ particleCount: 70, spread: 60 });
        const updated = addXPAndCoins(100, Math.round(score / 5));
        if (onProfileUpdate) onProfileUpdate(updated);
      }
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto bg-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-2xl text-center">
      
      {/* Top Header Styled after Screenshot 143910.png */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-amber-400 font-heading">
            Block Mania 🧩
          </h2>
          <p className="text-xs text-slate-400">Place shapes & clear rows and columns</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setMode(m => m === 'single' ? 'duel' : 'single');
              restartGame();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-bold rounded-xl transition-colors"
          >
            <Users className="w-3.5 h-3.5 text-amber-400" />
            <span>{mode === 'single' ? 'Solo' : `P${activePlayer}'s Turn`}</span>
          </button>
          <button
            onClick={restartGame}
            className="p-2 bg-slate-800 hover:bg-slate-700 rounded-xl"
            title="Restart"
          >
            <RotateCcw className="w-4 h-4 text-slate-300" />
          </button>
        </div>
      </div>

      {/* Score Header Bar */}
      <div className="flex items-center justify-between max-w-xs mx-auto mb-4 px-4 py-2 bg-slate-800/90 rounded-2xl text-xs font-bold">
        <div className="flex items-center gap-1.5 text-amber-400">
          <Trophy className="w-4 h-4" />
          <span>High: {highScore}</span>
        </div>
        <div className="text-xl font-black font-mono text-white">
          {score}
        </div>
      </div>

      {/* 8x8 Grid Arena Styled after Screenshot 143910.png */}
      <div className="p-3 bg-slate-950 rounded-2xl border-2 border-slate-800 inline-block shadow-inner mb-6">
        <div className="grid grid-cols-8 gap-1 w-64 h-64 sm:w-72 sm:h-72">
          {board.map((row, r) =>
            row.map((color, c) => (
              <button
                key={`${r}-${c}`}
                onClick={() => handleCellClick(r, c)}
                className={`w-full h-full rounded-md transition-all duration-150 transform active:scale-95 ${
                  color ? 'shadow-sm' : 'bg-slate-800/60 hover:bg-slate-700/60'
                }`}
                style={{ backgroundColor: color || undefined }}
              />
            ))
          )}
        </div>
      </div>

      {/* 3 Selectable Shapes Tray Styled after Screenshot 143910.png */}
      <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800 max-w-md mx-auto">
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">
          {selectedShapeIdx !== null ? 'Tap grid to place block' : 'Select a block shape'}
        </p>

        <div className="grid grid-cols-3 gap-3">
          {currentShapes.map((shape, idx) => {
            if (!shape) {
              return (
                <div key={idx} className="h-20 rounded-xl bg-slate-900/40 border border-dashed border-slate-800 flex items-center justify-center opacity-30 text-xs">
                  Placed
                </div>
              );
            }
            const isSelected = selectedShapeIdx === idx;
            return (
              <div
                key={idx}
                onClick={() => {
                  soundManager.playPop();
                  setSelectedShapeIdx(idx);
                }}
                className={`h-20 rounded-xl p-2 cursor-pointer transition-all flex items-center justify-center ${
                  isSelected
                    ? 'bg-slate-800 border-2 border-amber-400 shadow-md scale-105'
                    : 'bg-slate-900 border border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex flex-col gap-0.5">
                  {shape.matrix.map((row, mr) => (
                    <div key={mr} className="flex gap-0.5">
                      {row.map((cell, mc) => (
                        <div
                          key={mc}
                          className="w-3.5 h-3.5 rounded-xs"
                          style={{ backgroundColor: cell ? shape.color : 'transparent' }}
                        />
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Game Over Modal */}
      {isGameOver && (
        <div className="mt-4 p-4 bg-slate-800 border border-rose-500/50 rounded-2xl max-w-xs mx-auto animate-bounce">
          <p className="text-sm font-bold text-amber-300">{winnerNotice}</p>
          <button
            onClick={restartGame}
            className="btn-fun mt-2 px-6 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-full text-xs shadow-md"
          >
            Play Again
          </button>
        </div>
      )}

    </div>
  );
}
