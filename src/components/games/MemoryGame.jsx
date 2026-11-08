import React, { useState, useEffect } from 'react';
import { RotateCcw, Timer, Award, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundManager } from '../../utils/soundEffects';
import { addXPAndCoins } from '../../utils/storage';

const ANIMAL_CARDS = [
  { id: 'frog', name: 'Frog', emoji: '🐸', bg: 'bg-emerald-100' },
  { id: 'cat', name: 'Cat', emoji: '🐱', bg: 'bg-amber-100' },
  { id: 'kangaroo', name: 'Kangaroo', emoji: '🦘', bg: 'bg-orange-100' },
  { id: 'bulldog', name: 'Bulldog', emoji: '🐶', bg: 'bg-stone-100' },
  { id: 'bat', name: 'Fennec', emoji: '🦊', bg: 'bg-rose-100' },
  { id: 'ostrich', name: 'Ostrich', emoji: '🦤', bg: 'bg-sky-100' },
  { id: 'turtle', name: 'Turtle', emoji: '🐢', bg: 'bg-teal-100' },
  { id: 'bird', name: 'Bluebird', emoji: '🐦', bg: 'bg-blue-100' },
];

export default function MemoryGame({ onProfileUpdate }) {
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [moves, setMoves] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [isWon, setIsWon] = useState(false);

  // Initialize and shuffle 8 pairs (16 cards)
  const initializeGame = () => {
    soundManager.playClick();
    const deck = [...ANIMAL_CARDS, ...ANIMAL_CARDS].map((item, idx) => ({
      uniqueId: `${item.id}-${idx}`,
      pairId: item.id,
      emoji: item.emoji,
      name: item.name,
      bg: item.bg,
    }));

    // Fisher-Yates shuffle
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }

    setCards(deck);
    setFlipped([]);
    setMatched([]);
    setMoves(0);
    setSeconds(0);
    setTimerActive(false);
    setIsWon(false);
  };

  useEffect(() => {
    initializeGame();
  }, []);

  // Timer effect
  useEffect(() => {
    let interval = null;
    if (timerActive && !isWon) {
      interval = setInterval(() => {
        setSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerActive, isWon]);

  const handleCardClick = (index) => {
    if (!timerActive) {
      setTimerActive(true);
    }

    if (flipped.length === 2 || flipped.includes(index) || matched.includes(cards[index].pairId)) {
      return;
    }

    soundManager.playCardFlip();
    const newFlipped = [...flipped, index];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(prev => prev + 1);
      const [firstIdx, secondIdx] = newFlipped;

      if (cards[firstIdx].pairId === cards[secondIdx].pairId) {
        // Matched!
        soundManager.playMatchSuccess();
        const newMatched = [...matched, cards[firstIdx].pairId];
        setMatched(newMatched);
        setFlipped([]);

        // Check victory
        if (newMatched.length === ANIMAL_CARDS.length) {
          setIsWon(true);
          setTimerActive(false);
          soundManager.playWin();
          confetti({ particleCount: 100, spread: 70 });
          const updated = addXPAndCoins(150, 300);
          if (onProfileUpdate) onProfileUpdate(updated);
        }
      } else {
        // Not matched, flip back
        setTimeout(() => {
          setFlipped([]);
        }, 900);
      }
    }
  };

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return `${mins}:${rem < 10 ? '0' : ''}${rem}`;
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-gradient-to-b from-lime-200 via-emerald-100 to-green-200 p-6 sm:p-8 rounded-3xl border-4 border-emerald-300 shadow-xl text-center">
      
      {/* Title Styled exactly like Screenshot 131322.png */}
      <div className="mb-6 space-y-1">
        <h2 className="text-3xl sm:text-4xl font-black text-amber-900 tracking-tight font-heading drop-shadow-sm flex items-center justify-center gap-2">
          <span>Match Pairs</span>
        </h2>
        <h3 className="text-2xl sm:text-3xl font-black text-cyan-600 font-heading">
          Memory Card
        </h3>
      </div>

      {/* Stats Bar */}
      <div className="flex items-center justify-between max-w-md mx-auto mb-6 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-2xl border border-emerald-200 shadow-sm text-xs font-bold text-slate-700">
        <div className="flex items-center gap-1.5">
          <Timer className="w-4 h-4 text-emerald-600" />
          <span>Time: {formatTime(seconds)}</span>
        </div>
        <div>
          <span>Moves: {moves}</span>
        </div>
        <div>
          <span>Pairs: {matched.length} / {ANIMAL_CARDS.length}</span>
        </div>
        <button
          onClick={initializeGame}
          className="p-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-xl transition-colors"
          title="Restart Game"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 4x4 Glowing Card Arena */}
      <div className="p-4 bg-white/60 rounded-3xl border-4 border-cyan-400 shadow-lg shadow-cyan-100 inline-block">
        <div className="grid grid-cols-4 gap-2.5 sm:gap-3.5">
          {cards.map((card, index) => {
            const isFlipped = flipped.includes(index) || matched.includes(card.pairId);
            return (
              <button
                key={card.uniqueId}
                onClick={() => handleCardClick(index)}
                disabled={isFlipped}
                className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl border-2 transition-all duration-300 transform perspective-500 cursor-pointer flex items-center justify-center ${
                  isFlipped
                    ? `${card.bg} border-amber-300 shadow-md rotate-y-0 scale-95`
                    : 'bg-[#fef9c3] border-amber-300 hover:bg-amber-100 shadow-sm'
                }`}
              >
                {isFlipped ? (
                  <span className="text-3xl sm:text-4xl select-none animate-scale">
                    {card.emoji}
                  </span>
                ) : (
                  <span className="text-xl sm:text-2xl opacity-40 select-none">
                    ❓
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Victory Announcement */}
      {isWon && (
        <div className="mt-6 p-4 bg-white rounded-2xl border-2 border-emerald-400 shadow-md max-w-sm mx-auto space-y-2 animate-bounce">
          <h4 className="text-lg font-black text-emerald-800 font-heading">
            🎉 Fantastic Memory!
          </h4>
          <p className="text-xs text-slate-600">
            Completed in <strong>{moves} moves</strong> ({formatTime(seconds)}).
            You earned +150 XP and +300 Coins!
          </p>
          <button
            onClick={initializeGame}
            className="btn-fun px-6 py-2 bg-emerald-500 hover:bg-emerald-400 text-white rounded-full text-xs font-bold shadow-sm"
          >
            Play Again
          </button>
        </div>
      )}

    </div>
  );
}
