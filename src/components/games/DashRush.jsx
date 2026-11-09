import React, { useRef, useState, useEffect } from 'react';
import { Play, RotateCcw, ArrowLeft, ArrowRight, ArrowUp, ArrowDown, Users, Coins } from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundManager } from '../../utils/soundEffects';
import { addXPAndCoins } from '../../utils/storage';

export default function DashRush({ onProfileUpdate }) {
  const canvasRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [distance, setDistance] = useState(0);
  const [coinsCollected, setCoinsCollected] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [mode, setMode] = useState('single'); // 'single' | 'duel'
  const [activePlayer, setActivePlayer] = useState(1);
  const [p1Score, setP1Score] = useState(null);
  const [winnerNotice, setWinnerNotice] = useState('');

  const state = useRef({
    lane: 1, // 0 = left, 1 = center, 2 = right
    yOffset: 0, // for jumping
    isJumping: false,
    jumpVelocity: 0,
    isSliding: false,
    slideTimer: 0,
    speed: 5.5,
    obstacles: [],
    coins: [],
    frame: 0,
    animId: null,
  });

  const startGame = () => {
    soundManager.playPop();
    state.current = {
      lane: 1,
      yOffset: 0,
      isJumping: false,
      jumpVelocity: 0,
      isSliding: false,
      slideTimer: 0,
      speed: 5.5,
      obstacles: [],
      coins: [],
      frame: 0,
      animId: null,
    };

    setDistance(0);
    setCoinsCollected(0);
    setIsGameOver(false);
    setWinnerNotice('');
    setIsPlaying(true);
  };

  const jump = () => {
    if (!state.current.isJumping) {
      soundManager.playJump();
      state.current.isJumping = true;
      state.current.jumpVelocity = 12;
    }
  };

  const slide = () => {
    soundManager.playClick();
    state.current.isSliding = true;
    state.current.slideTimer = 35;
  };

  const moveLeft = () => {
    if (state.current.lane > 0) {
      soundManager.playClick();
      state.current.lane -= 1;
    }
  };

  const moveRight = () => {
    if (state.current.lane < 2) {
      soundManager.playClick();
      state.current.lane += 1;
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isPlaying) return;
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') moveLeft();
      if (e.code === 'ArrowRight' || e.code === 'KeyD') moveRight();
      if (e.code === 'ArrowUp' || e.code === 'KeyW' || e.code === 'Space') {
        e.preventDefault();
        jump();
      }
      if (e.code === 'ArrowDown' || e.code === 'KeyS') {
        e.preventDefault();
        slide();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying]);

  useEffect(() => {
    if (!isPlaying) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const laneWidth = width / 3;

    const render = () => {
      const s = state.current;
      s.frame++;
      s.speed += 0.0015;

      // Jump physics
      if (s.isJumping) {
        s.yOffset += s.jumpVelocity;
        s.jumpVelocity -= 0.8;
        if (s.yOffset <= 0) {
          s.yOffset = 0;
          s.isJumping = false;
        }
      }

      // Slide countdown
      if (s.isSliding) {
        s.slideTimer--;
        if (s.slideTimer <= 0) s.isSliding = false;
      }

      // Spawn obstacles (Every ~60 frames)
      if (s.frame % 65 === 0) {
        const obsLane = Math.floor(Math.random() * 3);
        const type = Math.random() > 0.4 ? 'barrier' : 'cart'; // barrier can be jumped over, cart must be avoided
        s.obstacles.push({
          lane: obsLane,
          y: -50,
          type: type,
        });
      }

      // Spawn coins
      if (s.frame % 40 === 0) {
        const coinLane = Math.floor(Math.random() * 3);
        s.coins.push({
          lane: coinLane,
          y: -30,
        });
      }

      // Draw Perspective Road (from Screenshot 143757.png)
      ctx.fillStyle = '#f59e0b'; // Sky gradient top
      const grad = ctx.createLinearGradient(0, 0, 0, height);
      grad.addColorStop(0, '#7dd3fc');
      grad.addColorStop(0.35, '#bae6fd');
      grad.addColorStop(0.35, '#d97706');
      grad.addColorStop(1, '#92400e');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Draw 3 lanes with lines
      ctx.strokeStyle = '#fef3c7';
      ctx.lineWidth = 4;
      ctx.setLineDash([12, 12]);
      ctx.beginPath();
      ctx.moveTo(laneWidth, 0);
      ctx.lineTo(laneWidth, height);
      ctx.moveTo(laneWidth * 2, 0);
      ctx.lineTo(laneWidth * 2, height);
      ctx.stroke();
      ctx.setLineDash([]);

      // Update & Draw Coins
      for (let i = s.coins.length - 1; i >= 0; i--) {
        const c = s.coins[i];
        c.y += s.speed;

        const cx = c.lane * laneWidth + laneWidth / 2;
        ctx.fillStyle = '#facc15';
        ctx.shadowBlur = 8;
        ctx.shadowColor = '#fde047';
        ctx.beginPath();
        ctx.arc(cx, c.y, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Player coin collision
        const playerY = height - 70 - s.yOffset;
        if (c.lane === s.lane && Math.abs(c.y - playerY) < 30) {
          soundManager.playPop();
          setCoinsCollected(n => n + 1);
          s.coins.splice(i, 1);
          continue;
        }

        if (c.y > height + 20) s.coins.splice(i, 1);
      }

      // Update & Draw Obstacles
      for (let i = s.obstacles.length - 1; i >= 0; i--) {
        const obs = s.obstacles[i];
        obs.y += s.speed;
        const ox = obs.lane * laneWidth + 15;
        const ow = laneWidth - 30;

        if (obs.type === 'barrier') {
          // Wooden log barrier (can jump over)
          ctx.fillStyle = '#78350f';
          ctx.fillRect(ox, obs.y, ow, 22);
          ctx.fillStyle = '#b45309';
          ctx.fillRect(ox + 5, obs.y + 4, ow - 10, 14);
        } else {
          // High wagon cart (must switch lanes)
          ctx.fillStyle = '#dc2626';
          ctx.fillRect(ox, obs.y, ow, 45);
          ctx.fillStyle = '#f87171';
          ctx.fillRect(ox + 8, obs.y + 8, ow - 16, 20);
        }

        // Collision Check
        const playerY = height - 70;
        if (obs.lane === s.lane && obs.y + 35 > playerY && obs.y < playerY + 50) {
          if (obs.type === 'barrier' && s.yOffset > 25) {
            // Jumped over successfully!
          } else {
            // Crashed!
            soundManager.playLoss();
            handleCrash();
            return;
          }
        }

        if (obs.y > height + 50) s.obstacles.splice(i, 1);
      }

      // Draw Player Character (Cute Bunny/Hero from Screenshot 143757.png)
      const px = s.lane * laneWidth + laneWidth / 2;
      const py = height - 70 - s.yOffset;

      ctx.save();
      if (s.isSliding) {
        // Flattened sliding bunny
        ctx.fillStyle = '#f472b6';
        ctx.beginPath();
        ctx.ellipse(px, py + 15, 24, 12, 0, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Standing / Jumping character
        // Body
        ctx.fillStyle = '#f472b6';
        ctx.beginPath();
        ctx.arc(px, py, 18, 0, Math.PI * 2);
        ctx.fill();

        // Ears
        ctx.beginPath();
        ctx.ellipse(px - 7, py - 24, 5, 12, -0.2, 0, Math.PI * 2);
        ctx.ellipse(px + 7, py - 24, 5, 12, 0.2, 0, Math.PI * 2);
        ctx.fill();

        // Overalls
        ctx.fillStyle = '#3b82f6';
        ctx.beginPath();
        ctx.arc(px, py + 8, 14, 0, Math.PI);
        ctx.fill();
      }
      ctx.restore();

      setDistance(d => d + 1);
      s.animId = requestAnimationFrame(render);
    };

    const handleCrash = () => {
      setIsPlaying(false);
      setIsGameOver(true);

      if (mode === 'duel') {
        if (activePlayer === 1) {
          setP1Score(distance);
          setActivePlayer(2);
          soundManager.playWin();
          setWinnerNotice(`Player 1 finished with ${distance}m! Player 2, your turn!`);
        } else {
          // duel finish
          if (distance > p1Score) {
            setWinnerNotice(`Player 2 Wins (${distance}m vs ${p1Score}m)! 🏆`);
          } else if (p1Score > distance) {
            setWinnerNotice(`Player 1 Wins (${p1Score}m vs ${distance}m)! 🏆`);
          } else {
            setWinnerNotice(`Tie Game (${distance}m each)! 🤝`);
          }
          soundManager.playWin();
          confetti({ particleCount: 80, spread: 60 });
        }
      } else {
        setWinnerNotice(`You dashed ${distance}m and collected ${coinsCollected} coins!`);
        soundManager.playWin();
        confetti({ particleCount: 70, spread: 60 });
        const updated = addXPAndCoins(80, coinsCollected * 10 + 50);
        if (onProfileUpdate) onProfileUpdate(updated);
      }
    };

    state.current.animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(state.current.animId);
  }, [isPlaying, distance, coinsCollected, mode, activePlayer, p1Score]);

  return (
    <div className="w-full max-w-xl mx-auto bg-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-2xl text-center">
      
      {/* Title & Mode */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-amber-400 font-heading">
            Dash Rush 🏃‍♂️
          </h2>
          <p className="text-xs text-slate-400">Jump, slide & collect coins on the track</p>
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
            <Users className="w-3.5 h-3.5 text-amber-400" />
            <span>{mode === 'single' ? 'Solo' : `P${activePlayer}'s Run`}</span>
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

      {/* Stats */}
      <div className="flex items-center justify-between max-w-sm mx-auto mb-3 px-4 py-2 bg-slate-800 rounded-2xl text-xs font-bold">
        <div>
          Distance: <span className="text-emerald-400 font-mono text-sm">{distance}m</span>
        </div>
        <div className="flex items-center gap-1 text-amber-400 font-bold">
          <Coins className="w-4 h-4 fill-current" />
          <span className="font-mono text-sm">{coinsCollected}</span>
        </div>
      </div>

      {/* Canvas */}
      <div className="relative rounded-2xl overflow-hidden border-2 border-slate-700 aspect-[3/4] max-w-xs mx-auto bg-slate-950 flex items-center justify-center">
        <canvas
          ref={canvasRef}
          width={300}
          height={400}
          className="w-full h-full block"
        />

        {!isPlaying && (
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs flex flex-col items-center justify-center p-6 space-y-3">
            <span className="text-5xl animate-bounce">🐰</span>
            <h3 className="text-2xl font-black text-white font-heading">
              {isGameOver ? 'Run Over!' : 'Dash Rush'}
            </h3>
            {winnerNotice && (
              <p className="text-xs text-amber-300 font-bold max-w-xs">{winnerNotice}</p>
            )}
            <p className="text-xs text-slate-300 max-w-xs">
              Use Left / Right arrow keys to steer. Up / Space to jump, Down to slide!
            </p>
            <button
              onClick={startGame}
              className="btn-fun px-6 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-full text-xs shadow-md"
            >
              {isGameOver ? 'Dash Again' : 'Start Running'}
            </button>
          </div>
        )}
      </div>

      {/* On-Screen Mobile Controls */}
      <div className="mt-4 flex items-center justify-center gap-3">
        <button
          onClick={moveLeft}
          className="p-3 bg-slate-800 active:bg-slate-700 rounded-xl"
          title="Move Left"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <button
          onClick={jump}
          className="px-5 py-3 bg-amber-400 active:bg-amber-300 text-slate-950 rounded-xl font-black text-xs flex items-center gap-1"
          title="Jump"
        >
          <ArrowUp className="w-4 h-4" />
          <span>JUMP</span>
        </button>
        <button
          onClick={slide}
          className="px-5 py-3 bg-indigo-500 active:bg-indigo-400 text-white rounded-xl font-black text-xs flex items-center gap-1"
          title="Slide"
        >
          <ArrowDown className="w-4 h-4" />
          <span>SLIDE</span>
        </button>
        <button
          onClick={moveRight}
          className="p-3 bg-slate-800 active:bg-slate-700 rounded-xl"
          title="Move Right"
        >
          <ArrowRight className="w-5 h-5 text-white" />
        </button>
      </div>

    </div>
  );
}
