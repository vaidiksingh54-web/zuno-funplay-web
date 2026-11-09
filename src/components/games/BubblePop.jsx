import React, { useRef, useState, useEffect } from 'react';
import { Play, RotateCcw, Users, Trophy, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundManager } from '../../utils/soundEffects';
import { addXPAndCoins } from '../../utils/storage';

const BUBBLE_COLORS = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];
const ROWS = 8;
const COLS = 10;
const RADIUS = 18;

export default function BubblePop({ onProfileUpdate }) {
  const canvasRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [movesLeft, setMovesLeft] = useState(25);
  const [mode, setMode] = useState('single'); // 'single' | 'duel'
  const [activePlayer, setActivePlayer] = useState(1);
  const [scores, setScores] = useState({ p1: 0, p2: 0 });
  const [isGameOver, setIsGameOver] = useState(false);
  const [winnerMessage, setWinnerMessage] = useState('');

  const state = useRef({
    grid: [],
    shooterColor: '#ef4444',
    nextColor: '#3b82f6',
    aimAngle: -Math.PI / 2,
    bullet: null,
    animId: null,
  });

  const initGrid = () => {
    const grid = [];
    for (let r = 0; r < ROWS; r++) {
      const row = [];
      for (let c = 0; c < COLS; c++) {
        // top 4 rows filled with bubbles
        if (r < 5) {
          row.push(BUBBLE_COLORS[Math.floor(Math.random() * BUBBLE_COLORS.length)]);
        } else {
          row.push(null);
        }
      }
      grid.push(row);
    }
    return grid;
  };

  const startGame = () => {
    soundManager.playPop();
    state.current.grid = initGrid();
    state.current.shooterColor = BUBBLE_COLORS[Math.floor(Math.random() * BUBBLE_COLORS.length)];
    state.current.nextColor = BUBBLE_COLORS[Math.floor(Math.random() * BUBBLE_COLORS.length)];
    state.current.bullet = null;
    state.current.aimAngle = -Math.PI / 2;

    setScore(0);
    setMovesLeft(mode === 'duel' ? 12 : 25);
    setScores({ p1: 0, p2: 0 });
    setActivePlayer(1);
    setIsGameOver(false);
    setWinnerMessage('');
    setIsPlaying(true);
  };

  useEffect(() => {
    if (!isPlaying) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      const sx = width / 2;
      const sy = height - 35;
      let angle = Math.atan2(my - sy, mx - sx);
      // clamp upwards
      if (angle > -0.2) angle = -0.2;
      if (angle < -Math.PI + 0.2) angle = -Math.PI + 0.2;
      state.current.aimAngle = angle;
    };

    const handleShoot = () => {
      if (state.current.bullet) return;
      soundManager.playPop();

      const sx = width / 2;
      const sy = height - 35;
      const speed = 12;
      state.current.bullet = {
        x: sx,
        y: sy,
        vx: Math.cos(state.current.aimAngle) * speed,
        vy: Math.sin(state.current.aimAngle) * speed,
        color: state.current.shooterColor,
      };

      state.current.shooterColor = state.current.nextColor;
      state.current.nextColor = BUBBLE_COLORS[Math.floor(Math.random() * BUBBLE_COLORS.length)];

      setMovesLeft(prev => {
        const nextMoves = prev - 1;
        if (nextMoves <= 0) {
          // turn or game over
          setTimeout(() => endTurnOrGame(), 600);
        }
        return nextMoves;
      });
    };

    const endTurnOrGame = () => {
      if (mode === 'duel') {
        if (activePlayer === 1) {
          setActivePlayer(2);
          setMovesLeft(12);
          soundManager.playWin();
        } else {
          // Game Over Duel
          setIsPlaying(false);
          setIsGameOver(true);
          const p1 = scores.p1;
          const p2 = scores.p2;
          if (p1 > p2) setWinnerMessage('Player 1 Wins the Bubble Duel! 🏆');
          else if (p2 > p1) setWinnerMessage('Player 2 Wins the Bubble Duel! 🏆');
          else setWinnerMessage('It is a Draw! 🤝');
          soundManager.playWin();
          confetti({ particleCount: 80, spread: 60 });
        }
      } else {
        // Single player over
        setIsPlaying(false);
        setIsGameOver(true);
        setWinnerMessage(`Awesome Game! Final Score: ${score}`);
        soundManager.playWin();
        confetti({ particleCount: 70, spread: 60 });
        const updated = addXPAndCoins(100, Math.round(score / 5));
        if (onProfileUpdate) onProfileUpdate(updated);
      }
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('click', handleShoot);

    const render = () => {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, width, height);

      // Draw starry ambient background
      ctx.fillStyle = '#1e293b';
      for (let i = 0; i < 20; i++) {
        ctx.fillRect((i * 47) % width, (i * 31) % height, 2, 2);
      }

      // Draw Grid of bubbles
      const grid = state.current.grid;
      for (let r = 0; r < ROWS; r++) {
        const rowOffset = (r % 2 === 1) ? RADIUS : 0;
        for (let c = 0; c < COLS; c++) {
          const color = grid[r][c];
          if (color) {
            const bx = c * (RADIUS * 2) + RADIUS + 10 + rowOffset;
            const by = r * (RADIUS * 1.8) + RADIUS + 15;
            drawBubble(ctx, bx, by, RADIUS, color);
          }
        }
      }

      // Update and Draw Bullet
      const b = state.current.bullet;
      if (b) {
        b.x += b.vx;
        b.y += b.vy;

        // Bounce on walls
        if (b.x - RADIUS <= 0 || b.x + RADIUS >= width) {
          b.vx *= -1;
          soundManager.playClick();
        }

        // Check ceiling or bubble collision
        let collided = false;
        if (b.y - RADIUS <= 15) {
          collided = true;
        } else {
          for (let r = 0; r < ROWS; r++) {
            const rowOffset = (r % 2 === 1) ? RADIUS : 0;
            for (let c = 0; c < COLS; c++) {
              if (grid[r][c]) {
                const bx = c * (RADIUS * 2) + RADIUS + 10 + rowOffset;
                const by = r * (RADIUS * 1.8) + RADIUS + 15;
                const dist = Math.hypot(b.x - bx, b.y - by);
                if (dist < RADIUS * 1.8) {
                  collided = true;
                  break;
                }
              }
            }
            if (collided) break;
          }
        }

        if (collided) {
          snapBulletToGrid(b);
          state.current.bullet = null;
        } else {
          drawBubble(ctx, b.x, b.y, RADIUS, b.color);
        }
      }

      // Draw Shooter Base & Aim line
      const sx = width / 2;
      const sy = height - 35;

      // Aim dotted line
      ctx.setLineDash([4, 6]);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(sx + Math.cos(state.current.aimAngle) * 90, sy + Math.sin(state.current.aimAngle) * 90);
      ctx.stroke();
      ctx.setLineDash([]);

      // Current Bubble
      drawBubble(ctx, sx, sy, RADIUS + 2, state.current.shooterColor);

      // Next Bubble indicator
      ctx.fillStyle = '#64748b';
      ctx.font = 'bold 10px sans-serif';
      ctx.fillText('NEXT', sx - 50, sy + 4);
      drawBubble(ctx, sx - 25, sy, RADIUS - 4, state.current.nextColor);

      state.current.animId = requestAnimationFrame(render);
    };

    const snapBulletToGrid = (bullet) => {
      // Find closest grid spot
      let closestR = 0;
      let closestC = 0;
      let minDist = Infinity;

      for (let r = 0; r < ROWS; r++) {
        const rowOffset = (r % 2 === 1) ? RADIUS : 0;
        for (let c = 0; c < COLS; c++) {
          if (!grid[r][c]) {
            const bx = c * (RADIUS * 2) + RADIUS + 10 + rowOffset;
            const by = r * (RADIUS * 1.8) + RADIUS + 15;
            const dist = Math.hypot(bullet.x - bx, bullet.y - by);
            if (dist < minDist) {
              minDist = dist;
              closestR = r;
              closestC = c;
            }
          }
        }
      }

      grid[closestR][closestC] = bullet.color;

      // Find matching cluster
      const matched = [];
      const visited = new Set();
      const queue = [[closestR, closestC]];
      const targetColor = bullet.color;

      while (queue.length > 0) {
        const [cr, cc] = queue.pop();
        const key = `${cr},${cc}`;
        if (visited.has(key)) continue;
        visited.add(key);

        if (grid[cr]?.[cc] === targetColor) {
          matched.push([cr, cc]);

          // neighbors
          const isOdd = cr % 2 === 1;
          const neighbors = [
            [cr, cc - 1], [cr, cc + 1],
            [cr - 1, cc + (isOdd ? 1 : 0)], [cr - 1, cc - (isOdd ? 0 : 1)],
            [cr + 1, cc + (isOdd ? 1 : 0)], [cr + 1, cc - (isOdd ? 0 : 1)],
          ];

          for (const [nr, nc] of neighbors) {
            if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && !visited.has(`${nr},${nc}`)) {
              if (grid[nr][nc] === targetColor) {
                queue.push([nr, nc]);
              }
            }
          }
        }
      }

      // Pop if >= 3
      if (matched.length >= 3) {
        soundManager.playMatchSuccess();
        matched.forEach(([mr, mc]) => {
          grid[mr][mc] = null;
        });

        const pts = matched.length * 30;
        setScore(s => s + pts);
        if (mode === 'duel') {
          setScores(prev => ({
            ...prev,
            [activePlayer === 1 ? 'p1' : 'p2']: prev[activePlayer === 1 ? 'p1' : 'p2'] + pts,
          }));
        }
      } else {
        soundManager.playClick();
      }
    };

    const drawBubble = (c, x, y, r, color) => {
      c.save();
      c.shadowBlur = 8;
      c.shadowColor = color;
      c.fillStyle = color;
      c.beginPath();
      c.arc(x, y, r, 0, Math.PI * 2);
      c.fill();

      // Shiny reflection highlight
      c.fillStyle = 'rgba(255, 255, 255, 0.45)';
      c.beginPath();
      c.arc(x - r * 0.35, y - r * 0.35, r * 0.3, 0, Math.PI * 2);
      c.fill();
      c.restore();
    };

    state.current.animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(state.current.animId);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('click', handleShoot);
    };
  }, [isPlaying, activePlayer, mode]);

  return (
    <div className="w-full max-w-2xl mx-auto bg-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-2xl text-center">
      
      {/* Title & Mode Switcher */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4 pb-3 border-b border-slate-800">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-amber-400 font-heading">
            Bubble Pop 🎯
          </h2>
          <p className="text-xs text-slate-400">Match 3+ bubbles & trigger chain combos</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setMode(m => m === 'single' ? 'duel' : 'single');
              setIsPlaying(false);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 border border-slate-700 hover:bg-slate-700 text-xs font-bold rounded-xl transition-colors"
          >
            <Users className="w-3.5 h-3.5 text-amber-400" />
            <span>{mode === 'single' ? 'Mode: Solo' : 'Mode: 2P Duel'}</span>
          </button>
          <button
            onClick={startGame}
            className="p-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-colors"
            title="Restart"
          >
            <RotateCcw className="w-4 h-4 text-slate-300" />
          </button>
        </div>
      </div>

      {/* Score & Moves Bar */}
      <div className="flex items-center justify-between max-w-md mx-auto mb-3 px-4 py-2 bg-slate-800/80 rounded-2xl text-xs font-bold">
        {mode === 'duel' ? (
          <div className="flex items-center gap-4">
            <span className={`${activePlayer === 1 ? 'text-amber-400 font-black' : 'text-slate-400'}`}>
              P1: {scores.p1}
            </span>
            <span className={`${activePlayer === 2 ? 'text-pink-400 font-black' : 'text-slate-400'}`}>
              P2: {scores.p2}
            </span>
          </div>
        ) : (
          <div>
            Score: <span className="text-amber-400 font-mono text-sm">{score}</span>
          </div>
        )}

        <div>
          Shots Left: <span className="text-emerald-400 font-mono text-sm">{movesLeft}</span>
        </div>
      </div>

      {/* Canvas Shooter Arena */}
      <div className="relative rounded-2xl overflow-hidden border-2 border-slate-700 aspect-[4/3] max-w-lg mx-auto bg-slate-950 flex items-center justify-center">
        <canvas
          ref={canvasRef}
          width={440}
          height={380}
          className="w-full h-full block cursor-crosshair"
        />

        {!isPlaying && (
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs flex flex-col items-center justify-center p-6 space-y-3">
            <span className="text-5xl animate-bounce">🫧</span>
            <h3 className="text-2xl font-black text-white font-heading">
              {isGameOver ? 'Match Concluded!' : 'Ready to Pop?'}
            </h3>
            {winnerMessage && (
              <p className="text-xs text-amber-300 font-bold">{winnerMessage}</p>
            )}
            <p className="text-xs text-slate-300 max-w-xs">
              Aim with mouse and click to shoot. Connect 3 or more bubbles of the same color!
            </p>
            <button
              onClick={startGame}
              className="btn-fun px-6 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-full text-xs shadow-md"
            >
              {isGameOver ? 'Play Again' : 'Launch Game'}
            </button>
          </div>
        )}
      </div>

    </div>
  );
}
