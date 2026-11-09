import React, { useState, useEffect, useRef } from 'react';
import { Play, RotateCcw, Timer, Flame, Users, Heart } from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundManager } from '../../utils/soundEffects';
import { addXPAndCoins } from '../../utils/storage';

export default function WhackAttack({ onProfileUpdate }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [combo, setCombo] = useState(0);
  const [activeHoles, setActiveHoles] = useState(Array(6).fill(null)); // null | 'mole' | 'golden' | 'trap'
  const [hitHole, setHitHole] = useState(null);
  const [mode, setMode] = useState('single'); // 'single' | 'duel'
  const [activePlayer, setActivePlayer] = useState(1);
  const [p1Score, setP1Score] = useState(null);
  const [winnerNotice, setWinnerNotice] = useState('');

  const spawnTimer = useRef(null);
  const gameTimer = useRef(null);

  const startGame = () => {
    soundManager.playPop();
    setScore(0);
    setTimeLeft(30);
    setCombo(0);
    setActiveHoles(Array(6).fill(null));
    setWinnerNotice('');
    setIsPlaying(true);
  };

  // Game countdown
  useEffect(() => {
    if (!isPlaying) return;

    gameTimer.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          endRound();
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(gameTimer.current);
  }, [isPlaying, activePlayer, p1Score, mode, score]);

  // Spawning moles
  useEffect(() => {
    if (!isPlaying) return;

    spawnTimer.current = setInterval(() => {
      const holeIdx = Math.floor(Math.random() * 6);
      const isGolden = Math.random() < 0.2;
      const isTrap = Math.random() < 0.2;
      const type = isGolden ? 'golden' : isTrap ? 'trap' : 'mole';

      setActiveHoles(prev => {
        const next = [...prev];
        next[holeIdx] = type;
        return next;
      });

      // Disappear after 800ms
      setTimeout(() => {
        setActiveHoles(prev => {
          const next = [...prev];
          if (next[holeIdx] === type) next[holeIdx] = null;
          return next;
        });
      }, 750);
    }, 600);

    return () => clearInterval(spawnTimer.current);
  }, [isPlaying]);

  const endRound = () => {
    clearInterval(gameTimer.current);
    clearInterval(spawnTimer.current);
    setIsPlaying(false);

    if (mode === 'duel') {
      if (activePlayer === 1) {
        setP1Score(score);
        setActivePlayer(2);
        soundManager.playWin();
        setWinnerNotice(`Player 1 whacked a score of ${score}! Player 2, ready?`);
      } else {
        // Duel ended
        if (score > p1Score) {
          setWinnerNotice(`Player 2 Wins (${score} vs ${p1Score})! 🏆`);
        } else if (p1Score > score) {
          setWinnerNotice(`Player 1 Wins (${p1Score} vs ${score})! 🏆`);
        } else {
          setWinnerNotice(`Draw Match (${score} vs ${p1Score})! 🤝`);
        }
        soundManager.playWin();
        confetti({ particleCount: 80, spread: 60 });
      }
    } else {
      setWinnerNotice(`Great Reaction! Final Score: ${score}`);
      soundManager.playWin();
      confetti({ particleCount: 70, spread: 60 });
      const updated = addXPAndCoins(90, score * 3);
      if (onProfileUpdate) onProfileUpdate(updated);
    }
  };

  const handleWhack = (index) => {
    const type = activeHoles[index];
    if (!type || !isPlaying) return;

    setHitHole(index);
    setTimeout(() => setHitHole(null), 300);

    if (type === 'trap') {
      soundManager.playLoss();
      setScore(s => Math.max(0, s - 30));
      setCombo(0);
    } else {
      soundManager.playWhack();
      const pts = type === 'golden' ? 50 : 20;
      setScore(s => s + pts + combo * 5);
      setCombo(c => c + 1);
    }

    setActiveHoles(prev => {
      const next = [...prev];
      next[index] = null;
      return next;
    });
  };

  return (
    <div className="w-full max-w-xl mx-auto bg-gradient-to-b from-amber-100 via-amber-200 to-amber-300 rounded-3xl p-6 sm:p-8 border-4 border-amber-400 shadow-2xl text-center text-slate-900">
      
      {/* Header Styled after Screenshot 143854.png */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-amber-300">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-amber-950 font-heading">
            Whack Attack 🔨
          </h2>
          <p className="text-xs text-amber-800 font-bold">Tap fast before the moles hide back in their holes!</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setMode(m => m === 'single' ? 'duel' : 'single');
              setIsPlaying(false);
              setP1Score(null);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/90 hover:bg-white text-xs font-bold rounded-xl shadow-xs transition-colors"
          >
            <Users className="w-3.5 h-3.5 text-amber-700" />
            <span>{mode === 'single' ? 'Solo' : `P${activePlayer}'s Turn`}</span>
          </button>
          <button
            onClick={startGame}
            className="p-2 bg-white/90 hover:bg-white rounded-xl shadow-xs"
            title="Restart"
          >
            <RotateCcw className="w-4 h-4 text-slate-700" />
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="flex items-center justify-between max-w-md mx-auto mb-6 px-4 py-2 bg-white/80 backdrop-blur-xs rounded-2xl border border-amber-300 shadow-sm text-xs font-bold">
        <div className="flex items-center gap-1.5 text-rose-700">
          <Timer className="w-4 h-4" />
          <span className="font-mono text-sm">{timeLeft}s</span>
        </div>
        <div>
          Score: <span className="text-amber-800 font-black text-base">{score}</span>
        </div>
        {combo > 1 && (
          <div className="flex items-center gap-1 text-orange-600 animate-bounce">
            <Flame className="w-4 h-4 fill-current" />
            <span>{combo}x Combo!</span>
          </div>
        )}
      </div>

      {/* 6 Mole Holes Grid Styled after Screenshot 143854.png */}
      <div className="relative p-6 bg-[#b45309] rounded-3xl border-4 border-[#78350f] shadow-inner max-w-md mx-auto">
        <div className="grid grid-cols-3 gap-4 sm:gap-6">
          {activeHoles.map((moleType, idx) => (
            <div
              key={idx}
              onClick={() => handleWhack(idx)}
              className="relative w-20 h-20 sm:w-24 sm:h-24 mx-auto rounded-full bg-[#451a03] border-4 border-[#290e03] shadow-inner flex items-center justify-center cursor-pointer select-none overflow-hidden"
            >
              {/* Emerging Mole Character */}
              {moleType && (
                <div className="absolute inset-0 flex items-center justify-center animate-bounce transform hover:scale-105">
                  <span className="text-4xl sm:text-5xl drop-shadow-md">
                    {moleType === 'golden' ? '🐹' : moleType === 'trap' ? '💣' : '🐭'}
                  </span>
                  {moleType === 'golden' && (
                    <span className="absolute -top-1 right-2 text-xs">✨</span>
                  )}
                </div>
              )}

              {/* Hit BOOM Effect */}
              {hitHole === idx && (
                <div className="absolute inset-0 bg-amber-400/80 rounded-full flex items-center justify-center text-xs font-black text-rose-950 uppercase tracking-wider animate-ping-short">
                  BOOM! 💥
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Start / Game Over Modal Overlay */}
        {!isPlaying && (
          <div className="absolute inset-0 bg-black/75 backdrop-blur-xs rounded-3xl flex flex-col items-center justify-center p-6 text-white space-y-3">
            <span className="text-5xl">🔨</span>
            <h3 className="text-2xl font-black text-amber-400 font-heading">
              {winnerNotice ? 'Challenge Completed!' : 'Whack Attack'}
            </h3>
            {winnerNotice && (
              <p className="text-xs text-amber-300 font-bold">{winnerNotice}</p>
            )}
            <p className="text-xs text-slate-300 max-w-xs text-center">
              Tap moles as quickly as possible! Golden moles give +50, but avoid bombs!
            </p>
            <button
              onClick={startGame}
              className="btn-fun px-6 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-full text-xs shadow-md"
            >
              {winnerNotice ? 'Play Another Round' : 'Start Whacking'}
            </button>
          </div>
        )}
      </div>

    </div>
  );
}
