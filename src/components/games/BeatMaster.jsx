import React, { useRef, useState, useEffect } from 'react';
import { Play, RotateCcw, Music, Sparkles, Flame, Users } from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundManager } from '../../utils/soundEffects';
import { addXPAndCoins } from '../../utils/storage';

const LANES = [
  { key: 'D', color: '#f43f5e', label: 'D' },
  { key: 'F', color: '#38bdf8', label: 'F' },
  { key: 'J', color: '#a855f7', label: 'J' },
  { key: 'K', color: '#34d399', label: 'K' },
];

export default function BeatMaster({ onProfileUpdate }) {
  const canvasRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [hitFeedback, setHitFeedback] = useState(null); // 'PERFECT' | 'GOOD' | 'MISS'
  const [mode, setMode] = useState('single');
  const [activePlayer, setActivePlayer] = useState(1);
  const [p1Score, setP1Score] = useState(null);
  const [winnerNotice, setWinnerNotice] = useState('');

  const state = useRef({
    notes: [],
    frame: 0,
    speed: 4,
    health: 100,
    songDuration: 60 * 30, // 30 seconds at 60fps
    animId: null,
  });

  const startGame = () => {
    soundManager.playPop();
    state.current = {
      notes: [],
      frame: 0,
      speed: 4.2,
      health: 100,
      songDuration: 60 * 30,
      animId: null,
    };

    setScore(0);
    setCombo(0);
    setMaxCombo(0);
    setHitFeedback(null);
    setWinnerNotice('');
    setIsPlaying(true);
  };

  const handleLaneHit = (laneIdx) => {
    if (!isPlaying) return;
    const targetY = 320; // Target hit line
    let hitFound = false;

    for (let i = 0; i < state.current.notes.length; i++) {
      const n = state.current.notes[i];
      if (n.lane === laneIdx) {
        const diff = Math.abs(n.y - targetY);
        if (diff < 35) {
          hitFound = true;
          const isPerfect = diff < 16;
          soundManager.playBeatNote(laneIdx);

          setHitFeedback(isPerfect ? 'PERFECT ✨' : 'GOOD 👍');
          setTimeout(() => setHitFeedback(null), 400);

          const pts = isPerfect ? 100 : 50;
          setScore(s => s + pts + combo * 5);
          setCombo(c => {
            const next = c + 1;
            if (next > maxCombo) setMaxCombo(next);
            return next;
          });

          state.current.notes.splice(i, 1);
          break;
        }
      }
    }

    if (!hitFound) {
      soundManager.playClick();
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isPlaying) return;
      if (e.code === 'KeyD') handleLaneHit(0);
      if (e.code === 'KeyF') handleLaneHit(1);
      if (e.code === 'KeyJ') handleLaneHit(2);
      if (e.code === 'KeyK') handleLaneHit(3);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, combo, maxCombo]);

  useEffect(() => {
    if (!isPlaying) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const laneWidth = width / 4;
    const targetY = 320;

    const render = () => {
      const s = state.current;
      s.frame++;

      // Perspective 3D Runway Background (from Screenshot 144307.png)
      ctx.fillStyle = '#050510';
      ctx.fillRect(0, 0, width, height);

      // Draw 4 Lanes
      LANES.forEach((l, idx) => {
        const lx = idx * laneWidth;
        ctx.fillStyle = idx % 2 === 0 ? '#0f172a' : '#1e1b4b';
        ctx.fillRect(lx, 0, laneWidth, height);

        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 1;
        ctx.strokeRect(lx, 0, laneWidth, height);
      });

      // Target Line
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 4;
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#38bdf8';
      ctx.beginPath();
      ctx.moveTo(0, targetY);
      ctx.lineTo(width, targetY);
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Target Hit Pods
      LANES.forEach((l, idx) => {
        const lx = idx * laneWidth + laneWidth / 2;
        ctx.strokeStyle = l.color;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(lx, targetY, 20, 0, Math.PI * 2);
        ctx.stroke();
      });

      // Spawn Notes (Every ~25 frames)
      if (s.frame % 28 === 0) {
        const laneIdx = Math.floor(Math.random() * 4);
        s.notes.push({
          lane: laneIdx,
          y: -15,
          color: LANES[laneIdx].color,
        });
      }

      // Update & Draw Notes
      for (let i = s.notes.length - 1; i >= 0; i--) {
        const n = s.notes[i];
        n.y += s.speed;

        const nx = n.lane * laneWidth + laneWidth / 2;
        ctx.fillStyle = n.color;
        ctx.shadowBlur = 12;
        ctx.shadowColor = n.color;
        ctx.beginPath();
        ctx.ellipse(nx, n.y, 24, 10, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Missed note
        if (n.y > targetY + 30) {
          setCombo(0);
          setHitFeedback('MISS ❌');
          setTimeout(() => setHitFeedback(null), 300);
          s.notes.splice(i, 1);
        }
      }

      // Check song finish
      if (s.frame >= s.songDuration) {
        handleSongEnd();
        return;
      }

      s.animId = requestAnimationFrame(render);
    };

    const handleSongEnd = () => {
      setIsPlaying(false);

      if (mode === 'duel') {
        if (activePlayer === 1) {
          setP1Score(score);
          setActivePlayer(2);
          soundManager.playWin();
          setWinnerNotice(`Player 1 finished with ${score} pts! Player 2's turn!`);
        } else {
          if (score > p1Score) {
            setWinnerNotice(`Player 2 Wins (${score} vs ${p1Score})! 🏆`);
          } else if (p1Score > score) {
            setWinnerNotice(`Player 1 Wins (${p1Score} vs ${score})! 🏆`);
          } else {
            setWinnerNotice(`Draw Match (${score} pts each)! 🤝`);
          }
          soundManager.playWin();
          confetti({ particleCount: 80, spread: 60 });
        }
      } else {
        setWinnerNotice(`Rhythm Track Complete! Score: ${score} (Max Combo: ${maxCombo})`);
        soundManager.playWin();
        confetti({ particleCount: 70, spread: 60 });
        const updated = addXPAndCoins(120, Math.round(score / 5));
        if (onProfileUpdate) onProfileUpdate(updated);
      }
    };

    s.animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(s.animId);
  }, [isPlaying, score, combo, maxCombo, mode, activePlayer, p1Score]);

  return (
    <div className="w-full max-w-xl mx-auto bg-slate-950 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-2xl text-center">
      
      {/* Title & Mode */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-pink-400 font-heading">
            Beat Master 🎧
          </h2>
          <p className="text-xs text-slate-400">Hit keys [D, F, J, K] as notes cross the target line</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setMode(m => m === 'single' ? 'duel' : 'single');
              setIsPlaying(false);
              setP1Score(null);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-bold rounded-xl transition-colors"
          >
            <Users className="w-3.5 h-3.5 text-pink-400" />
            <span>{mode === 'single' ? 'Solo' : `P${activePlayer}'s Track`}</span>
          </button>
          <button
            onClick={startGame}
            className="p-2 bg-slate-800 hover:bg-slate-700 rounded-xl"
            title="Restart"
          >
            <RotateCcw className="w-4 h-4 text-slate-300" />
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="flex items-center justify-between max-w-sm mx-auto mb-3 px-4 py-2 bg-slate-900 rounded-2xl text-xs font-bold">
        <div>
          Score: <span className="text-pink-400 font-mono text-base">{score}</span>
        </div>
        {combo > 1 && (
          <div className="flex items-center gap-1 text-amber-400 font-black animate-pulse">
            <Flame className="w-4 h-4 fill-current" />
            <span>{combo}x Combo</span>
          </div>
        )}
        {hitFeedback && (
          <div className="text-xs font-black text-cyan-300 animate-bounce">
            {hitFeedback}
          </div>
        )}
      </div>

      {/* Canvas Runway */}
      <div className="relative rounded-2xl overflow-hidden border-2 border-slate-800 aspect-[3/4] max-w-xs mx-auto bg-black flex items-center justify-center">
        <canvas
          ref={canvasRef}
          width={320}
          height={380}
          className="w-full h-full block"
        />

        {!isPlaying && (
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs flex flex-col items-center justify-center p-6 space-y-3">
            <span className="text-5xl animate-bounce">🎹</span>
            <h3 className="text-2xl font-black text-pink-400 font-heading">
              {winnerNotice ? 'Track Concluded!' : 'Beat Master'}
            </h3>
            {winnerNotice && (
              <p className="text-xs text-amber-300 font-bold max-w-xs">{winnerNotice}</p>
            )}
            <p className="text-xs text-slate-300 max-w-xs">
              Press D, F, J, K or tap on-screen keys when notes align with the glowing target line!
            </p>
            <button
              onClick={startGame}
              className="btn-fun px-6 py-2.5 bg-pink-500 hover:bg-pink-400 text-white font-black rounded-full text-xs shadow-md"
            >
              {winnerNotice ? 'Play Again' : 'Drop The Beat'}
            </button>
          </div>
        )}
      </div>

      {/* On-Screen Mobile Hit Buttons */}
      <div className="mt-4 grid grid-cols-4 gap-2 max-w-xs mx-auto">
        {LANES.map((lane, idx) => (
          <button
            key={lane.key}
            onClick={() => handleLaneHit(idx)}
            style={{ backgroundColor: lane.color }}
            className="p-3.5 rounded-xl font-black text-sm text-slate-950 shadow-md active:scale-95 transition-transform"
          >
            {lane.label}
          </button>
        ))}
      </div>

    </div>
  );
}
