import React, { useRef, useState, useEffect } from 'react';
import { Play, RotateCcw, Shield, Zap, Trophy, Users } from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundManager } from '../../utils/soundEffects';
import { addXPAndCoins } from '../../utils/storage';

export default function SpaceSurvivor({ onProfileUpdate }) {
  const canvasRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [shields, setShields] = useState(3);
  const [multiplier, setMultiplier] = useState(1);
  const [mode, setMode] = useState('single'); // 'single' | 'duel'
  const [activePlayer, setActivePlayer] = useState(1);
  const [p1Score, setP1Score] = useState(null);
  const [winnerNotice, setWinnerNotice] = useState('');

  const state = useRef({
    shipX: 100,
    shipY: 180,
    lasers: [],
    asteroids: [],
    particles: [],
    frame: 0,
    animId: null,
  });

  const startGame = () => {
    soundManager.playPop();
    const canvas = canvasRef.current;
    const w = canvas ? canvas.width : 540;
    const h = canvas ? canvas.height : 360;

    state.current = {
      shipX: 80,
      shipY: h / 2,
      lasers: [],
      asteroids: [],
      particles: [],
      frame: 0,
      animId: null,
    };

    setScore(0);
    setShields(3);
    setMultiplier(1);
    setWinnerNotice('');
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
      const my = e.clientY - rect.top;
      state.current.shipY = Math.max(20, Math.min(height - 20, my));
    };

    const handleShoot = () => {
      soundManager.playLaser();
      state.current.lasers.push({
        x: state.current.shipX + 24,
        y: state.current.shipY,
        vx: 9,
      });
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('click', handleShoot);

    const render = () => {
      const s = state.current;
      s.frame++;

      // Background Starfield (Screenshot 144106.png style)
      ctx.fillStyle = '#050714';
      ctx.fillRect(0, 0, width, height);

      // Star grid
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1;
      for (let x = 0; x < width; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      // Auto-laser every 20 frames
      if (s.frame % 22 === 0) {
        soundManager.playLaser();
        s.lasers.push({
          x: s.shipX + 24,
          y: s.shipY,
          vx: 9,
        });
      }

      // Spawn Asteroids
      if (s.frame % 45 === 0) {
        s.asteroids.push({
          x: width + 20,
          y: Math.random() * (height - 40) + 20,
          vx: -(Math.random() * 2.5 + 2.5),
          radius: Math.random() * 12 + 14,
          color: Math.random() > 0.5 ? '#e11d48' : '#a855f7',
        });
      }

      // Update & Draw Lasers
      ctx.fillStyle = '#38bdf8';
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#0ea5e9';
      for (let i = s.lasers.length - 1; i >= 0; i--) {
        const l = s.lasers[i];
        l.x += l.vx;
        ctx.fillRect(l.x, l.y - 2, 16, 4);
        if (l.x > width + 20) s.lasers.splice(i, 1);
      }
      ctx.shadowBlur = 0;

      // Update & Draw Asteroids
      for (let i = s.asteroids.length - 1; i >= 0; i--) {
        const a = s.asteroids[i];
        a.x += a.vx;

        // Draw Asteroid
        ctx.fillStyle = a.color;
        ctx.shadowBlur = 8;
        ctx.shadowColor = a.color;
        ctx.beginPath();
        ctx.arc(a.x, a.y, a.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Laser vs Asteroid
        for (let j = s.lasers.length - 1; j >= 0; j--) {
          const l = s.lasers[j];
          if (Math.hypot(l.x - a.x, l.y - a.y) < a.radius + 6) {
            soundManager.playPop();
            s.lasers.splice(j, 1);
            s.asteroids.splice(i, 1);
            setScore(sc => sc + 50 * multiplier);
            setMultiplier(m => Math.min(10, m + 1));
            break;
          }
        }

        // Ship vs Asteroid Collision
        if (Math.hypot(s.shipX - a.x, s.shipY - a.y) < a.radius + 14) {
          soundManager.playLoss();
          s.asteroids.splice(i, 1);
          setMultiplier(1);
          setShields(sh => {
            const next = sh - 1;
            if (next <= 0) {
              handleGameOver();
            }
            return next;
          });
          break;
        }

        if (a.x < -30) s.asteroids.splice(i, 1);
      }

      // Draw Spaceship (Neon interceptor from Screenshot 144127.png)
      ctx.save();
      ctx.translate(s.shipX, s.shipY);
      ctx.fillStyle = '#06b6d4';
      ctx.shadowBlur = 12;
      ctx.shadowColor = '#06b6d4';
      ctx.beginPath();
      ctx.moveTo(22, 0);
      ctx.lineTo(-14, -12);
      ctx.lineTo(-6, 0);
      ctx.lineTo(-14, 12);
      ctx.closePath();
      ctx.fill();

      // Cockpit & Thruster glow
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.arc(2, 0, 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#f97316';
      ctx.fillRect(-18, -3, 8, 6);
      ctx.restore();

      s.animId = requestAnimationFrame(render);
    };

    const handleGameOver = () => {
      setIsPlaying(false);

      if (mode === 'duel') {
        if (activePlayer === 1) {
          setP1Score(score);
          setActivePlayer(2);
          soundManager.playWin();
          setWinnerNotice(`Player 1 scored ${score} pts! Player 2, board your ship!`);
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
        setWinnerNotice(`Mission Complete! Final Score: ${score}`);
        soundManager.playWin();
        confetti({ particleCount: 70, spread: 60 });
        const updated = addXPAndCoins(90, Math.round(score / 5));
        if (onProfileUpdate) onProfileUpdate(updated);
      }
    };

    s.animId = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(s.animId);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('click', handleShoot);
    };
  }, [isPlaying, shields, multiplier, score, mode, activePlayer, p1Score]);

  return (
    <div className="w-full max-w-2xl mx-auto bg-slate-950 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-2xl text-center">
      
      {/* Title & Mode */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-cyan-400 font-heading">
            Space Survivor 🚀
          </h2>
          <p className="text-xs text-slate-400">Pilot your starship, blast asteroids & survive the cosmos</p>
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
            <Users className="w-3.5 h-3.5 text-cyan-400" />
            <span>{mode === 'single' ? 'Solo' : `P${activePlayer}'s Flight`}</span>
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
      <div className="flex items-center justify-between max-w-md mx-auto mb-4 px-4 py-2 bg-slate-900 rounded-2xl text-xs font-bold">
        <div className="flex items-center gap-1.5 text-rose-400">
          <Shield className="w-4 h-4" />
          <span>Shields: {shields} / 3</span>
        </div>
        <div>
          Score: <span className="text-cyan-400 font-mono text-sm">{score}</span>
        </div>
        <div className="text-amber-400 font-bold">
          {multiplier}x Multiplier
        </div>
      </div>

      {/* Canvas */}
      <div className="relative rounded-2xl overflow-hidden border-2 border-slate-800 aspect-[16/10] max-w-xl mx-auto bg-black flex items-center justify-center">
        <canvas
          ref={canvasRef}
          width={540}
          height={340}
          className="w-full h-full block cursor-crosshair"
        />

        {!isPlaying && (
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs flex flex-col items-center justify-center p-6 space-y-3">
            <span className="text-5xl animate-pulse">🛸</span>
            <h3 className="text-2xl font-black text-cyan-300 font-heading">
              {winnerNotice ? 'Flight Concluded!' : 'Space Survivor'}
            </h3>
            {winnerNotice && (
              <p className="text-xs text-amber-300 font-bold">{winnerNotice}</p>
            )}
            <p className="text-xs text-slate-300 max-w-xs">
              Move mouse up/down to pilot ship. Lasers fire automatically (or click to shoot)!
            </p>
            <button
              onClick={startGame}
              className="btn-fun px-6 py-2.5 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-black rounded-full text-xs shadow-md"
            >
              {winnerNotice ? 'Fly Again' : 'Engage Thrusters'}
            </button>
          </div>
        )}
      </div>

    </div>
  );
}
