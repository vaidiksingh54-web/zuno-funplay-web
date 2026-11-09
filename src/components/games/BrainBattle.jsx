import React, { useState, useEffect } from 'react';
import { Brain, Trophy, Zap, Clock, Users, Bot, Sparkles, CheckCircle2, XCircle, RotateCcw } from 'lucide-react';
import { soundManager } from '../../utils/soundEffects';

const QUESTIONS = [
  {
    q: "Which planet in our solar system is known as the Red Planet?",
    options: ["Venus", "Mars", "Jupiter", "Saturn"],
    correct: 1,
    category: "Science",
  },
  {
    q: "In Minecraft, what tool is required to mine obsidian blocks?",
    options: ["Iron Pickaxe", "Diamond Pickaxe", "Golden Shovel", "Netherite Axe"],
    correct: 1,
    category: "Gaming",
  },
  {
    q: "What does HTML stand for in web development?",
    options: [
      "Hyper Text Markup Language",
      "High Tech Modern Language",
      "Hyperlink Text Mode Layout",
      "Home Tool Management Line",
    ],
    correct: 0,
    category: "Tech",
  },
  {
    q: "Which superhero is also known as the 'Caped Crusader'?",
    options: ["Superman", "Spider-Man", "Batman", "Iron Man"],
    correct: 2,
    category: "Movies",
  },
  {
    q: "How many hearts does an octopus have?",
    options: ["1", "2", "3", "4"],
    correct: 2,
    category: "Nature",
  },
  {
    q: "Which company created the famous Mario video game franchise?",
    options: ["Sony", "Nintendo", "Sega", "Ubisoft"],
    correct: 1,
    category: "Gaming",
  },
  {
    q: "What is the fastest land animal in the world?",
    options: ["Cheetah", "Lion", "Pronghorn", "Peregrine Falcon"],
    correct: 0,
    category: "Nature",
  },
  {
    q: "Which programming language is known for its mascot, a Python snake?",
    options: ["Ruby", "Python", "Swift", "Rust"],
    correct: 1,
    category: "Tech",
  },
];

export default function BrainBattle({ onProfileUpdate }) {
  const [mode, setMode] = useState('bot'); // 'bot' or 'pvp'
  const [currentRound, setCurrentRound] = useState(0);
  const [p1Score, setP1Score] = useState(0);
  const [p2Score, setP2Score] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10);
  const [p1Answered, setP1Answered] = useState(null); // chosen index
  const [p2Answered, setP2Answered] = useState(null); // chosen index or bot answer
  const [roundOver, setRoundOver] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [activePvPTurn, setActivePvPTurn] = useState(1); // For 2P mode: P1 then P2
  const [lifeline5050Used, setLifeline5050Used] = useState(false);
  const [hiddenOptions, setHiddenOptions] = useState([]);

  const currentQ = QUESTIONS[currentRound % QUESTIONS.length];

  // Round timer
  useEffect(() => {
    if (roundOver || gameOver) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleTimeExpire();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [currentRound, roundOver, gameOver, p1Answered, activePvPTurn]);

  const handleTimeExpire = () => {
    soundManager.playGameOver();
    resolveRound(p1Answered, p2Answered);
  };

  // Lifeline: 50/50
  const use5050 = () => {
    if (lifeline5050Used || roundOver) return;
    soundManager.playPop();
    setLifeline5050Used(true);
    const wrongs = [0, 1, 2, 3].filter(idx => idx !== currentQ.correct);
    // Shuffle and pick 2 wrongs to hide
    const toHide = wrongs.sort(() => 0.5 - Math.random()).slice(0, 2);
    setHiddenOptions(toHide);
  };

  const handleP1Select = (optIndex) => {
    if (p1Answered !== null || roundOver) return;
    soundManager.playClick();
    setP1Answered(optIndex);

    if (mode === 'bot') {
      // Simulate bot answer after small delay
      const botAccuracy = 0.75; // 75% smart
      const botPicksCorrect = Math.random() < botAccuracy;
      let botChoice = currentQ.correct;
      if (!botPicksCorrect) {
        const wrongs = [0, 1, 2, 3].filter(i => i !== currentQ.correct);
        botChoice = wrongs[Math.floor(Math.random() * wrongs.length)];
      }
      setP2Answered(botChoice);
      resolveRound(optIndex, botChoice);
    } else {
      // PVP Turn
      setActivePvPTurn(2);
    }
  };

  const handleP2Select = (optIndex) => {
    if (p2Answered !== null || roundOver) return;
    soundManager.playClick();
    setP2Answered(optIndex);
    resolveRound(p1Answered, optIndex);
  };

  const resolveRound = (ans1, ans2) => {
    setRoundOver(true);

    const speedBonus = timeLeft * 40;
    let addedP1 = 0;
    let addedP2 = 0;

    if (ans1 === currentQ.correct) {
      soundManager.playLevelUp();
      addedP1 = 500 + speedBonus;
      setP1Score(prev => prev + addedP1);
    } else {
      soundManager.playTone(180, 0.2, 'sawtooth');
    }

    if (ans2 === currentQ.correct) {
      addedP2 = 500 + (mode === 'bot' ? Math.floor(Math.random() * 200 + 100) : speedBonus);
      setP2Score(prev => prev + addedP2);
    }

    setTimeout(() => {
      if (currentRound + 1 >= 5) {
        setGameOver(true);
        if (onProfileUpdate && (ans1 === currentQ.correct)) {
          onProfileUpdate(prev => ({ ...prev, xp: prev.xp + 120, coins: prev.coins + 30 }));
        }
      } else {
        // Next round
        setCurrentRound(r => r + 1);
        setP1Answered(null);
        setP2Answered(null);
        setRoundOver(false);
        setTimeLeft(10);
        setActivePvPTurn(1);
        setHiddenOptions([]);
      }
    }, 2000);
  };

  const resetGame = () => {
    soundManager.playPop();
    setCurrentRound(0);
    setP1Score(0);
    setP2Score(0);
    setTimeLeft(10);
    setP1Answered(null);
    setP2Answered(null);
    setRoundOver(false);
    setGameOver(false);
    setActivePvPTurn(1);
    setLifeline5050Used(false);
    setHiddenOptions([]);
  };

  const totalPoints = p1Score + p2Score || 1;
  const p1Percent = Math.min(Math.max((p1Score / totalPoints) * 100, 10), 90);

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-4 sm:p-6 shadow-sm max-w-4xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-bold mb-1">
            <Brain className="w-3.5 h-3.5 text-purple-600" />
            <span>1v1 Live Quiz Duel</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading">
            Brain Battle Arena
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Answer faster to score more points! Outsmart the AI or battle a friend.
          </p>
        </div>

        {/* Mode Selector */}
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-2xl">
          <button
            onClick={() => { setMode('bot'); resetGame(); }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
              mode === 'bot' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            <span>VS ZunoBot</span>
          </button>
          <button
            onClick={() => { setMode('pvp'); resetGame(); }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
              mode === 'pvp' ? 'bg-amber-400 text-slate-950 shadow-xs' : 'text-slate-600'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>2P Friends</span>
          </button>
        </div>
      </div>

      {/* Duel Score Tug-Of-War Bar */}
      <div className="my-5 p-4 rounded-2xl bg-slate-900 text-white shadow-inner">
        <div className="flex justify-between items-center text-xs font-black uppercase tracking-wider mb-2">
          <div className="flex items-center gap-1 text-blue-400">
            <span>🧑 Player 1</span>
            <span className="text-base text-white ml-1 font-heading">{p1Score} pts</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-800 text-[10px] text-amber-400 font-mono">
            <Clock className="w-3 h-3 animate-spin" />
            <span>{timeLeft}s remaining</span>
          </div>
          <div className="flex items-center gap-1 text-pink-400">
            <span className="text-base text-white mr-1 font-heading">{p2Score} pts</span>
            <span>{mode === 'bot' ? '🤖 ZunoBot' : '🧑 Player 2'}</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden flex">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-500"
            style={{ width: `${p1Percent}%` }}
          ></div>
          <div
            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
            style={{ width: `${100 - p1Percent}%` }}
          ></div>
        </div>
      </div>

      {/* Main Question Card */}
      {!gameOver ? (
        <div className="space-y-4">
          
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold">
            <span className="px-2.5 py-1 bg-slate-100 rounded-lg text-slate-700">
              Round {currentRound + 1} of 5 • {currentQ.category}
            </span>
            <button
              onClick={use5050}
              disabled={lifeline5050Used || roundOver}
              className={`px-3 py-1 rounded-lg text-xs font-bold border transition-all ${
                lifeline5050Used
                  ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                  : 'bg-amber-100 text-amber-900 border-amber-300 hover:bg-amber-200'
              }`}
            >
              💡 50:50 Lifeline
            </button>
          </div>

          <div className="p-6 rounded-2xl bg-gradient-to-r from-amber-50/80 to-purple-50/60 border border-amber-200 text-center">
            <h3 className="text-lg sm:text-xl font-black text-slate-900 font-heading">
              {currentQ.q}
            </h3>
          </div>

          {/* Turn indicator in 2P Mode */}
          {mode === 'pvp' && !roundOver && (
            <div className="text-center text-xs font-bold py-1 px-3 bg-amber-100 text-amber-900 rounded-full w-max mx-auto animate-pulse">
              {activePvPTurn === 1 ? '👉 Player 1: Pick your answer' : '👉 Player 2: Pick your answer'}
            </div>
          )}

          {/* Options Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {currentQ.options.map((opt, idx) => {
              const isHidden = hiddenOptions.includes(idx);
              if (isHidden) {
                return (
                  <div key={idx} className="p-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50 opacity-40 text-center text-xs text-slate-400">
                    Eliminated
                  </div>
                );
              }

              let btnStyle = 'bg-white border-slate-200 hover:border-amber-400 text-slate-800';

              if (roundOver) {
                if (idx === currentQ.correct) {
                  btnStyle = 'bg-emerald-500 text-white border-emerald-600 shadow-md animate-pulse';
                } else if (p1Answered === idx || p2Answered === idx) {
                  btnStyle = 'bg-rose-500 text-white border-rose-600';
                } else {
                  btnStyle = 'bg-slate-50 text-slate-400 border-slate-200';
                }
              } else if (mode === 'bot' && p1Answered === idx) {
                btnStyle = 'bg-blue-500 text-white border-blue-600';
              }

              return (
                <button
                  key={idx}
                  onClick={() => {
                    if (mode === 'bot') {
                      handleP1Select(idx);
                    } else {
                      if (activePvPTurn === 1) handleP1Select(idx);
                      else handleP2Select(idx);
                    }
                  }}
                  disabled={roundOver}
                  className={`p-4 rounded-2xl border-2 text-left font-bold text-sm transition-all duration-150 flex items-center justify-between ${btnStyle}`}
                >
                  <span>{opt}</span>
                  {roundOver && idx === currentQ.correct && (
                    <CheckCircle2 className="w-5 h-5 text-white" />
                  )}
                  {roundOver && (p1Answered === idx || p2Answered === idx) && idx !== currentQ.correct && (
                    <XCircle className="w-5 h-5 text-white" />
                  )}
                </button>
              );
            })}
          </div>

        </div>
      ) : (
        /* Game Over Podium */
        <div className="py-8 text-center space-y-4 animate-scale-in">
          <div className="w-20 h-20 rounded-full bg-amber-400 flex items-center justify-center text-4xl mx-auto shadow-lg">
            🏆
          </div>
          <h3 className="text-3xl font-black text-slate-900 font-heading">
            {p1Score > p2Score
              ? '🎉 Player 1 Victorious!'
              : p2Score > p1Score
              ? mode === 'bot' ? '🤖 ZunoBot Won This Match!' : '🎉 Player 2 Victorious!'
              : '🤝 Epic Tie!'}
          </h3>
          <p className="text-sm text-slate-600 font-medium">
            Final Score: Player 1 ({p1Score} pts) vs {mode === 'bot' ? 'ZunoBot' : 'Player 2'} ({p2Score} pts)
          </p>
          <div className="pt-2">
            <button
              onClick={resetGame}
              className="btn-fun px-8 py-3.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-2xl text-base shadow-md inline-flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Play Another Duel</span>
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="mt-6 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
        <span>⚡ Speed bonus: Faster correct answers earn up to 400 extra bonus points!</span>
        <button
          onClick={resetGame}
          className="flex items-center gap-1 text-slate-700 font-bold hover:text-slate-900"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      </div>

    </div>
  );
}
