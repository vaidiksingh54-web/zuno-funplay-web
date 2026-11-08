import React, { useRef, useEffect, useState } from 'react';
import { Play, RotateCcw } from 'lucide-react';
import { soundManager } from '../../utils/soundEffects';
import { addXPAndCoins } from '../../utils/storage';

export default function ArcadeGames({ onProfileUpdate }) {
  const [activeSubGame, setActiveSubGame] = useState('flappy'); // 'flappy' | 'pong'
  const canvasRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  // Flappy game state
  const flappyState = useRef({
    birdY: 150,
    velocity: 0,
    gravity: 0.35,
    jump: -6.5,
    pipes: [],
    frame: 0,
  });

  // Pong game state
  const pongState = useRef({
    ballX: 250,
    ballY: 150,
    ballVX: 3.5,
    ballVY: 3,
    paddlePlayerY: 120,
    paddleBotY: 120,
    paddleHeight: 60,
    paddleWidth: 10,
  });

  const startGame = () => {
    soundManager.playPop();
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (activeSubGame === 'flappy') {
      flappyState.current = {
        birdY: canvas.height / 2,
        velocity: 0,
        gravity: 0.35,
        jump: -6.5,
        pipes: [],
        frame: 0,
      };
    } else {
      pongState.current = {
        ballX: canvas.width / 2,
        ballY: canvas.height / 2,
        ballVX: (Math.random() > 0.5 ? 1 : -1) * 3.5,
        ballVY: (Math.random() - 0.5) * 4,
        paddlePlayerY: canvas.height / 2 - 30,
        paddleBotY: canvas.height / 2 - 30,
        paddleHeight: 65,
        paddleWidth: 10,
      };
    }

    setScore(0);
    setGameOver(false);
    setIsPlaying(true);
  };

  // Canvas render loop
  useEffect(() => {
    if (!isPlaying) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;

    const handleAction = () => {
      if (activeSubGame === 'flappy') {
        soundManager.playPop();
        flappyState.current.velocity = flappyState.current.jump;
      }
    };

    const handleMouseMove = (e) => {
      if (activeSubGame === 'pong') {
        const rect = canvas.getBoundingClientRect();
        const y = e.clientY - rect.top;
        pongState.current.paddlePlayerY = Math.max(0, Math.min(canvas.height - pongState.current.paddleHeight, y - pongState.current.paddleHeight / 2));
      }
    };

    canvas.addEventListener('click', handleAction);
    window.addEventListener('keydown', (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
        handleAction();
      }
    });
    canvas.addEventListener('mousemove', handleMouseMove);

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;

      if (activeSubGame === 'flappy') {
        // Flappy Sky & Ground
        ctx.fillStyle = '#70c5ce';
        ctx.fillRect(0, 0, width, height);

        // Ground
        ctx.fillStyle = '#ded895';
        ctx.fillRect(0, height - 30, width, 30);
        ctx.fillStyle = '#73bf2e';
        ctx.fillRect(0, height - 35, width, 5);

        // Bird physics
        const f = flappyState.current;
        f.velocity += f.gravity;
        f.birdY += f.velocity;
        f.frame++;

        // Add pipes
        if (f.frame % 90 === 0) {
          const gap = 110;
          const topH = Math.random() * (height - gap - 90) + 30;
          f.pipes.push({ x: width, top: topH, bottom: topH + gap, passed: false });
        }

        // Render pipes
        ctx.fillStyle = '#73bf2e';
        ctx.strokeStyle = '#548c22';
        ctx.lineWidth = 2;

        for (let i = f.pipes.length - 1; i >= 0; i--) {
          const p = f.pipes[i];
          p.x -= 2.2;

          // Top pipe
          ctx.fillRect(p.x, 0, 40, p.top);
          ctx.strokeRect(p.x, 0, 40, p.top);

          // Bottom pipe
          ctx.fillRect(p.x, p.bottom, 40, height - p.bottom - 30);
          ctx.strokeRect(p.x, p.bottom, 40, height - p.bottom - 30);

          // Check pass
          if (!p.passed && p.x + 40 < 50) {
            p.passed = true;
            soundManager.playClick();
            setScore(s => {
              const next = s + 1;
              if (next > highScore) setHighScore(next);
              return next;
            });
          }

          // Collision check
          const birdX = 50;
          const birdRadius = 12;
          if (
            birdX + birdRadius > p.x && birdX - birdRadius < p.x + 40 &&
            (f.birdY - birdRadius < p.top || f.birdY + birdRadius > p.bottom)
          ) {
            soundManager.playLoss();
            setIsPlaying(false);
            setGameOver(true);
            return;
          }

          if (p.x < -50) f.pipes.splice(i, 1);
        }

        // Check ground/ceiling hit
        if (f.birdY + 12 >= height - 30 || f.birdY - 12 <= 0) {
          soundManager.playLoss();
          setIsPlaying(false);
          setGameOver(true);
          return;
        }

        // Draw cute bird
        ctx.fillStyle = '#facc15';
        ctx.beginPath();
        ctx.arc(50, f.birdY, 12, 0, Math.PI * 2);
        ctx.fill();

        // Eye & Beak
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(54, f.birdY - 3, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(55, f.birdY - 3, 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#f97316';
        ctx.beginPath();
        ctx.moveTo(60, f.birdY);
        ctx.lineTo(66, f.birdY + 3);
        ctx.lineTo(60, f.birdY + 6);
        ctx.fill();

      } else {
        // Space Pong Mode
        ctx.fillStyle = '#090d16';
        ctx.fillRect(0, 0, width, height);

        // Center line
        ctx.setLineDash([6, 6]);
        ctx.strokeStyle = '#334155';
        ctx.beginPath();
        ctx.moveTo(width / 2, 0);
        ctx.lineTo(width / 2, height);
        ctx.stroke();
        ctx.setLineDash([]);

        const p = pongState.current;
        p.ballX += p.ballVX;
        p.ballY += p.ballVY;

        // Bot AI tracking
        const botCenter = p.paddleBotY + p.paddleHeight / 2;
        if (botCenter < p.ballY - 10) p.paddleBotY += 2.8;
        else if (botCenter > p.ballY + 10) p.paddleBotY -= 2.8;

        // Top/bottom bounce
        if (p.ballY <= 6 || p.ballY >= height - 6) {
          p.ballVY *= -1;
          soundManager.playClick();
        }

        // Player paddle collision
        if (
          p.ballX - 6 <= 20 + p.paddleWidth &&
          p.ballY >= p.paddlePlayerY &&
          p.ballY <= p.paddlePlayerY + p.paddleHeight
        ) {
          p.ballVX = Math.abs(p.ballVX) * 1.05;
          soundManager.playPop();
          setScore(s => s + 1);
        }

        // Bot paddle collision
        if (
          p.ballX + 6 >= width - 20 - p.paddleWidth &&
          p.ballY >= p.paddleBotY &&
          p.ballY <= p.paddleBotY + p.paddleHeight
        ) {
          p.ballVX = -Math.abs(p.ballVX);
          soundManager.playClick();
        }

        // Missed ball
        if (p.ballX < 0) {
          soundManager.playLoss();
          setIsPlaying(false);
          setGameOver(true);
          return;
        } else if (p.ballX > width) {
          // Point to player
          p.ballX = width / 2;
          p.ballY = height / 2;
          p.ballVX = -3;
          soundManager.playWin();
          setScore(s => s + 3);
        }

        // Draw Player Paddle (Pink/Cyan)
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(20, p.paddlePlayerY, p.paddleWidth, p.paddleHeight);

        // Draw Bot Paddle (Purple)
        ctx.fillStyle = '#ec4899';
        ctx.fillRect(width - 20 - p.paddleWidth, p.paddleBotY, p.paddleWidth, p.paddleHeight);

        // Draw Ball
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.arc(p.ballX, p.ballY, 7, 0, Math.PI * 2);
        ctx.fill();
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(animId);
      canvas.removeEventListener('click', handleAction);
      canvas.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isPlaying, activeSubGame]);

  return (
    <div className="w-full max-w-xl mx-auto bg-white rounded-3xl p-6 border border-slate-200 shadow-md text-center">
      
      {/* Tab Switcher between Flappy and Pong */}
      <div className="inline-flex p-1 bg-slate-100 rounded-full mb-4">
        <button
          onClick={() => {
            soundManager.playClick();
            setActiveSubGame('flappy');
            setIsPlaying(false);
          }}
          className={`px-5 py-2 rounded-full text-xs font-bold transition-all ${
            activeSubGame === 'flappy' ? 'bg-amber-400 text-slate-950 shadow-sm' : 'text-slate-600'
          }`}
        >
          Flappy Bird 🐦
        </button>
        <button
          onClick={() => {
            soundManager.playClick();
            setActiveSubGame('pong');
            setIsPlaying(false);
          }}
          className={`px-5 py-2 rounded-full text-xs font-bold transition-all ${
            activeSubGame === 'pong' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600'
          }`}
        >
          Space Pong 🏓
        </button>
      </div>

      <div className="flex items-center justify-between mb-3 px-2">
        <span className="text-sm font-bold text-slate-700">
          Score: <span className="text-amber-600 text-lg font-black">{score}</span>
        </span>
        <span className="text-xs text-slate-500 font-medium">
          {activeSubGame === 'flappy' ? 'Click / Space to Flap' : 'Move Mouse to Defend'}
        </span>
      </div>

      {/* Game Canvas */}
      <div className="relative rounded-2xl overflow-hidden border-2 border-slate-200 aspect-[4/3] bg-slate-900 mx-auto max-w-md">
        <canvas
          ref={canvasRef}
          width={450}
          height={320}
          className="w-full h-full block cursor-pointer"
        />

        {!isPlaying && (
          <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center space-y-3">
            <span className="text-5xl">{activeSubGame === 'flappy' ? '🐥' : '🚀'}</span>
            <h4 className="text-xl font-black text-white font-heading">
              {gameOver ? 'Try Again!' : activeSubGame === 'flappy' ? 'Flappy Flyer' : 'Space Pong'}
            </h4>
            <p className="text-xs text-slate-300">
              {gameOver ? `You scored ${score} points!` : 'Test your arcade reflexes & score big!'}
            </p>
            <button
              onClick={startGame}
              className="btn-fun px-6 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-full text-xs shadow-md"
            >
              Play Now
            </button>
          </div>
        )}
      </div>

    </div>
  );
}
