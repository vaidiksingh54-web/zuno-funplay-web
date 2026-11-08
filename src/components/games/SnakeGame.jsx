import React, { useRef, useEffect, useState } from 'react';
import { Play, RotateCcw, Zap, Trophy } from 'lucide-react';
import { soundManager } from '../../utils/soundEffects';
import { recordMissionCompletion, addXPAndCoins } from '../../utils/storage';

export default function SnakeGame({ onProfileUpdate }) {
  const canvasRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [highScore, setHighScore] = useState(165);

  const gameState = useRef({
    snake: [{ x: 300, y: 200 }],
    length: 15,
    angle: 0,
    speed: 3,
    targetAngle: 0,
    boost: false,
    foods: [],
    bots: [],
    animationId: null,
  });

  const leaderboard = [
    { rank: 1, name: 'Pro Cobra', score: 570 },
    { rank: 2, name: 'Pro Hunter', score: 528 },
    { rank: 3, name: 'Pro Rogue', score: 520 },
    { rank: 4, name: 'Pro Ghost', score: 470 },
    { rank: 5, name: 'Pro Alpha', score: 390 },
    { rank: 6, name: 'Blaze', score: 185 },
    { rank: 7, name: 'Venom (You)', score: Math.max(score, highScore) },
    { rank: 8, name: 'Viper', score: 150 },
    { rank: 9, name: 'Viper II', score: 145 },
    { rank: 10, name: 'snakewrangler', score: 140 },
  ].sort((a, b) => b.score - a.score).map((item, idx) => ({ ...item, rank: idx + 1 }));

  // Spawn random glowing food
  const spawnFood = (width, height, count = 35) => {
    const colors = ['#38bdf8', '#fbbf24', '#f43f5e', '#a855f7', '#34d399'];
    const foods = [];
    for (let i = 0; i < count; i++) {
      foods.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 3 + 3,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }
    return foods;
  };

  const startGame = () => {
    soundManager.playPop();
    const canvas = canvasRef.current;
    if (!canvas) return;

    const width = canvas.width;
    const height = canvas.height;

    gameState.current.snake = [];
    for (let i = 0; i < 15; i++) {
      gameState.current.snake.push({ x: width / 2 - i * 5, y: height / 2 });
    }
    gameState.current.length = 15;
    gameState.current.speed = 3.2;
    gameState.current.angle = 0;
    gameState.current.targetAngle = 0;
    gameState.current.foods = spawnFood(width, height, 40);
    
    // Ambient friendly bot snakes
    gameState.current.bots = [
      {
        name: 'Pro Alpha',
        body: Array(12).fill(0).map((_, i) => ({ x: 100 - i * 5, y: 120 })),
        angle: 0.5,
        color: '#fbbf24',
      },
      {
        name: 'Pro Ghost',
        body: Array(14).fill(0).map((_, i) => ({ x: 500 + i * 5, y: 300 })),
        angle: -1.2,
        color: '#2dd4bf',
      }
    ];

    setScore(0);
    setIsGameOver(false);
    setIsPlaying(true);
  };

  useEffect(() => {
    if (!isPlaying) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      const head = gameState.current.snake[0];
      if (head) {
        gameState.current.targetAngle = Math.atan2(mouseY - head.y, mouseX - head.x);
      }
    };

    const handleMouseDown = () => {
      gameState.current.boost = true;
      gameState.current.speed = 5.5;
    };

    const handleMouseUp = () => {
      gameState.current.boost = false;
      gameState.current.speed = 3.2;
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mouseup', handleMouseUp);

    // Main animation loop
    const render = () => {
      const width = canvas.width;
      const height = canvas.height;

      // Dark grid background from Screenshot 131245.png
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, width, height);

      // Draw subtle grid lines
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1;
      const gridSize = 30;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Draw glowing food pellets
      gameState.current.foods.forEach((food) => {
        ctx.shadowBlur = 8;
        ctx.shadowColor = food.color;
        ctx.fillStyle = food.color;
        ctx.beginPath();
        ctx.arc(food.x, food.y, food.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // Update and Draw Bots
      gameState.current.bots.forEach((bot) => {
        bot.angle += (Math.random() - 0.5) * 0.1;
        const bHead = bot.body[0];
        const newBX = (bHead.x + Math.cos(bot.angle) * 2 + width) % width;
        const newBY = (bHead.y + Math.sin(bot.angle) * 2 + height) % height;
        bot.body.unshift({ x: newBX, y: newBY });
        bot.body.pop();

        // Draw bot segments
        ctx.fillStyle = bot.color;
        bot.body.forEach((seg, idx) => {
          ctx.beginPath();
          ctx.arc(seg.x, seg.y, Math.max(4, 9 - idx * 0.3), 0, Math.PI * 2);
          ctx.fill();
        });
        ctx.fillStyle = '#94a3b8';
        ctx.font = '10px sans-serif';
        ctx.fillText(bot.name, bHead.x - 15, bHead.y - 12);
      });

      // Update Player Snake Angle
      let diff = gameState.current.targetAngle - gameState.current.angle;
      while (diff < -Math.PI) diff += Math.PI * 2;
      while (diff > Math.PI) diff -= Math.PI * 2;
      gameState.current.angle += diff * 0.12;

      // Update Player Head
      const head = gameState.current.snake[0];
      let newX = head.x + Math.cos(gameState.current.angle) * gameState.current.speed;
      let newY = head.y + Math.sin(gameState.current.angle) * gameState.current.speed;

      // Wall collision or wrap
      if (newX < 0 || newX > width || newY < 0 || newY > height) {
        soundManager.playLoss();
        setIsPlaying(false);
        setIsGameOver(true);
        return;
      }

      gameState.current.snake.unshift({ x: newX, y: newY });
      while (gameState.current.snake.length > gameState.current.length) {
        gameState.current.snake.pop();
      }

      // Check food eating
      gameState.current.foods = gameState.current.foods.filter((food) => {
        const dist = Math.hypot(food.x - newX, food.y - newY);
        if (dist < 14) {
          soundManager.playPop();
          gameState.current.length += 2;
          setScore(s => {
            const next = s + 10;
            if (next > highScore) setHighScore(next);
            if (next >= 50) {
              recordMissionCompletion('snake');
            }
            return next;
          });
          return false;
        }
        return true;
      });

      // Replenish food
      if (gameState.current.foods.length < 30) {
        gameState.current.foods.push({
          x: Math.random() * width,
          y: Math.random() * height,
          radius: Math.random() * 3 + 3,
          color: '#34d399',
        });
      }

      // Draw Player Snake (Bright turquoise glowing rings with eyes matching 131245.png)
      gameState.current.snake.forEach((seg, idx) => {
        ctx.shadowBlur = idx === 0 ? 10 : 4;
        ctx.shadowColor = '#2dd4bf';
        ctx.fillStyle = idx % 2 === 0 ? '#2dd4bf' : '#14b8a6';
        ctx.beginPath();
        const r = Math.max(5, 11 - (idx / gameState.current.snake.length) * 4);
        ctx.arc(seg.x, seg.y, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Draw cute eyes on head
        if (idx === 0) {
          const eyeOffset1 = gameState.current.angle + 0.6;
          const eyeOffset2 = gameState.current.angle - 0.6;
          const eyeR = 6;
          ctx.fillStyle = 'white';
          ctx.beginPath();
          ctx.arc(seg.x + Math.cos(eyeOffset1) * eyeR, seg.y + Math.sin(eyeOffset1) * eyeR, 3, 0, Math.PI * 2);
          ctx.arc(seg.x + Math.cos(eyeOffset2) * eyeR, seg.y + Math.sin(eyeOffset2) * eyeR, 3, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = 'black';
          ctx.beginPath();
          ctx.arc(seg.x + Math.cos(eyeOffset1) * eyeR, seg.y + Math.sin(eyeOffset1) * eyeR, 1.5, 0, Math.PI * 2);
          ctx.arc(seg.x + Math.cos(eyeOffset2) * eyeR, seg.y + Math.sin(eyeOffset2) * eyeR, 1.5, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // Player Name label
      ctx.fillStyle = '#e2e8f0';
      ctx.font = 'bold 11px sans-serif';
      ctx.fillText('Venom', newX - 16, newY - 16);

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isPlaying]);

  return (
    <div className="w-full max-w-4xl mx-auto bg-slate-950 text-white rounded-3xl p-6 border border-slate-800 shadow-2xl relative overflow-hidden">
      
      {/* Top Header & Live Score Bar — Styled after 131245.png */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-xs text-slate-400 font-bold uppercase tracking-widest">CURRENT SCORE</div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-heading">
            Venom: <span className="text-white">{score}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!isPlaying && (
            <button
              onClick={startGame}
              className="btn-fun flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-full text-xs shadow-md"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>{isGameOver ? 'Play Again' : 'Start Slither'}</span>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Main Canvas Arena */}
        <div className="lg:col-span-8 relative rounded-2xl overflow-hidden border-2 border-slate-800 bg-slate-900 aspect-[4/3] flex items-center justify-center">
          <canvas
            ref={canvasRef}
            width={640}
            height={480}
            className="w-full h-full cursor-crosshair block"
          />

          {!isPlaying && !isGameOver && (
            <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center space-y-4">
              <span className="text-6xl animate-bounce">🐍</span>
              <h3 className="text-2xl font-black text-white font-heading">Slither Arena</h3>
              <p className="text-xs text-slate-300 max-w-xs">
                Move your mouse to steer your snake. Gobble up glowing orbs and grow massive!
              </p>
              <button
                onClick={startGame}
                className="btn-fun px-8 py-3 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black rounded-full text-sm shadow-lg"
              >
                Slither In!
              </button>
            </div>
          )}

          {isGameOver && (
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center space-y-3">
              <span className="text-5xl">💥</span>
              <h3 className="text-2xl font-black text-rose-400 font-heading">Game Over!</h3>
              <p className="text-sm text-slate-300">
                You scored <strong className="text-emerald-400">{score}</strong> points.
              </p>
              <button
                onClick={startGame}
                className="btn-fun px-6 py-2.5 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black rounded-full text-xs shadow-md"
              >
                Try Again
              </button>
            </div>
          )}
        </div>

        {/* Right Column: Leaderboard Panel Matching Screenshot 131245.png */}
        <div className="lg:col-span-4 bg-slate-900/90 rounded-2xl p-4 border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800 text-rose-400 font-bold text-xs uppercase tracking-wider">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span>
            <span>LEADERBOARD</span>
          </div>

          <div className="space-y-1.5 text-xs font-semibold max-h-72 overflow-y-auto pr-1">
            {leaderboard.map((item) => (
              <div
                key={item.rank}
                className={`flex items-center justify-between px-3 py-1.5 rounded-lg ${
                  item.name.includes('Venom')
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold'
                    : 'text-slate-300 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="w-5 text-slate-500 font-mono text-[10px]">{item.rank}.</span>
                  <span className="truncate max-w-[110px]">{item.name}</span>
                </div>
                <span className="font-mono text-amber-400 font-bold">{item.score}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Bottom Floating Control Hint Matching Screenshot 131245.png */}
      <div className="mt-4 flex justify-center">
        <div className="px-6 py-2 rounded-full bg-slate-900/80 border border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider shadow-inner">
          MOVE MOUSE TO STEER • CLICK TO BOOST
        </div>
      </div>

    </div>
  );
}
