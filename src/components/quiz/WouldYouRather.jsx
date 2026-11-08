import React, { useState } from 'react';
import { ArrowRight, RotateCcw, ThumbsUp, Sparkles, Check } from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundManager } from '../../utils/soundEffects';
import { addXPAndCoins } from '../../utils/storage';

const DILEMMAS = [
  {
    id: 1,
    optionA: "Eat anything delicious and never gain weight",
    optionB: "Always eat for free at any five-star restaurant",
    votesA: 64,
    votesB: 36,
  },
  {
    id: 2,
    optionA: "Be single for 5 years with unlimited wealth",
    optionB: "Not travel for 5 years with your true soulmate",
    votesA: 52,
    votesB: 48,
  },
  {
    id: 3,
    optionA: "Find out someone's deepest thoughts through a handshake",
    optionB: "Be able to make anyone do you one giant favor once",
    votesA: 59,
    votesB: 41,
  },
  {
    id: 4,
    optionA: "Have friendly ghosts help you clean your house",
    optionB: "Become an immortal friendly ghost after death",
    votesA: 71,
    votesB: 29,
  },
  {
    id: 5,
    optionA: "Master every video game in the world instantly",
    optionB: "Speak every language fluently like a native",
    votesA: 38,
    votesB: 62,
  },
  {
    id: 6,
    optionA: "Have unlimited battery on all your devices forever",
    optionB: "Have ultra-fast gigabit Wi-Fi wherever you go on Earth",
    votesA: 44,
    votesB: 56,
  },
];

export default function WouldYouRather({ onProfileUpdate }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null); // 'A' | 'B'
  const [customVotes, setCustomVotes] = useState({});

  const currentDilemma = DILEMMAS[currentIndex];

  const handleVote = (option) => {
    if (selectedOption) return;
    soundManager.playPop();
    setSelectedOption(option);

    const isA = option === 'A';
    setCustomVotes(prev => ({
      ...prev,
      [currentDilemma.id]: {
        votesA: isA ? currentDilemma.votesA + 1 : currentDilemma.votesA,
        votesB: !isA ? currentDilemma.votesB + 1 : currentDilemma.votesB,
      }
    }));

    confetti({ particleCount: 40, spread: 50 });
    const updated = addXPAndCoins(40, 80);
    if (onProfileUpdate) onProfileUpdate(updated);
  };

  const nextDilemma = () => {
    soundManager.playClick();
    setSelectedOption(null);
    setCurrentIndex((prev) => (prev + 1) % DILEMMAS.length);
  };

  const votes = customVotes[currentDilemma.id] || {
    votesA: currentDilemma.votesA,
    votesB: currentDilemma.votesB,
  };
  const totalVotes = votes.votesA + votes.votesB;
  const percentA = Math.round((votes.votesA / totalVotes) * 100);
  const percentB = 100 - percentA;

  return (
    <div className="w-full max-w-xl mx-auto space-y-6">
      
      {/* Dilemma Card Styled after Screenshot 131035.png */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-lg text-center relative overflow-hidden">
        
        <div className="mb-6">
          <span className="text-xs font-black tracking-widest uppercase text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
            Dilemma #{currentIndex + 1} of {DILEMMAS.length}
          </span>
          <h2 className="text-3xl font-black text-indigo-900 mt-2 font-heading tracking-tight">
            WOULD YOU RATHER?
          </h2>
        </div>

        <div className="space-y-4 relative">
          
          {/* Option A (Blue Card) */}
          <div
            onClick={() => handleVote('A')}
            className={`cursor-pointer rounded-2xl p-6 transition-all duration-300 relative overflow-hidden text-white font-bold text-lg select-none flex flex-col justify-center min-h-[140px] ${
              selectedOption === 'A'
                ? 'bg-indigo-600 ring-4 ring-indigo-300 shadow-md scale-102'
                : 'bg-[#4338ca] hover:bg-indigo-700 shadow-sm hover:scale-101'
            }`}
          >
            <p className="font-extrabold uppercase tracking-wide text-sm sm:text-base leading-snug">
              {currentDilemma.optionA}
            </p>

            {selectedOption && (
              <div className="mt-3 pt-3 border-t border-indigo-400/50 flex items-center justify-between text-xs animate-fade-in">
                <span className="font-black text-amber-300 text-lg">{percentA}%</span>
                <span className="opacity-90">{votes.votesA} people picked this</span>
                {selectedOption === 'A' && <Check className="w-5 h-5 text-emerald-300" />}
              </div>
            )}
          </div>

          {/* Central OR Pill Badge */}
          <div className="relative flex justify-center -my-2 z-10">
            <div className="w-12 h-12 rounded-full bg-white border-4 border-slate-100 shadow-md flex items-center justify-center font-black text-slate-800 text-sm tracking-wider">
              OR
            </div>
          </div>

          {/* Option B (Lime / Green Card) */}
          <div
            onClick={() => handleVote('B')}
            className={`cursor-pointer rounded-2xl p-6 transition-all duration-300 relative overflow-hidden text-slate-900 font-bold text-lg select-none flex flex-col justify-center min-h-[140px] ${
              selectedOption === 'B'
                ? 'bg-[#84cc16] ring-4 ring-lime-300 shadow-md scale-102'
                : 'bg-[#65a30d] text-white hover:bg-[#4d7c0f] shadow-sm hover:scale-101'
            }`}
          >
            <p className="font-extrabold uppercase tracking-wide text-sm sm:text-base leading-snug">
              {currentDilemma.optionB}
            </p>

            {selectedOption && (
              <div className="mt-3 pt-3 border-t border-white/30 flex items-center justify-between text-xs animate-fade-in">
                <span className="font-black text-amber-200 text-lg">{percentB}%</span>
                <span className="opacity-90">{votes.votesB} people picked this</span>
                {selectedOption === 'B' && <Check className="w-5 h-5 text-emerald-200" />}
              </div>
            )}
          </div>

        </div>

        {/* Footer Next Button */}
        {selectedOption && (
          <div className="mt-6 flex justify-center">
            <button
              onClick={nextDilemma}
              className="btn-fun flex items-center gap-2 px-8 py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-full text-sm shadow-md"
            >
              <span>Next Dilemma</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

      </div>

    </div>
  );
}
