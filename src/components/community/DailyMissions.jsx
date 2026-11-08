import React from 'react';
import { Gift, CheckCircle2, Coins, ArrowRight, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundManager } from '../../utils/soundEffects';
import { recordMissionCompletion } from '../../utils/storage';

export default function DailyMissions({ profile, onProfileUpdate, setActiveTab }) {
  const missions = [
    {
      key: 'tictactoe',
      title: 'Duel in Tic-Tac-Toe',
      desc: 'Play a match of 3x3 against the AI or a friend',
      targetTab: 'games',
      reward: 1000,
      icon: '⚔️',
      color: 'bg-rose-50 border-rose-200',
    },
    {
      key: 'snake',
      title: 'Grow in Slither Snake',
      desc: 'Score at least 50 points in the snake arena',
      targetTab: 'games',
      reward: 1000,
      icon: '🐍',
      color: 'bg-teal-50 border-teal-200',
    },
    {
      key: 'quiz',
      title: 'Trivia Brainiac',
      desc: 'Complete today\'s Daily Trivia Challenge',
      targetTab: 'quiz',
      reward: 1000,
      icon: '🏆',
      color: 'bg-amber-50 border-amber-200',
    },
    {
      key: 'creative',
      title: 'Artistic Spark',
      desc: 'Draw and download a masterpiece in Studio',
      targetTab: 'creative',
      reward: 1000,
      icon: '🎨',
      color: 'bg-purple-50 border-purple-200',
    },
    {
      key: 'spin',
      title: 'Lucky Wheel Spin',
      desc: 'Spin the prize wheel in Quiz World',
      targetTab: 'quiz',
      reward: 1000,
      icon: '🎡',
      color: 'bg-sky-50 border-sky-200',
    },
  ];

  const completedCount = Object.values(profile.completedMissions || {}).filter(Boolean).length;

  const handleClaim = (key) => {
    soundManager.playWin();
    confetti({ particleCount: 70, spread: 60 });
    const updated = recordMissionCompletion(key);
    if (onProfileUpdate) onProfileUpdate(updated);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      
      {/* Scroll Theme Parchment Banner Styled after Screenshot 131345.png */}
      <div className="relative rounded-3xl bg-gradient-to-b from-[#fef3c7] via-[#fde68a] to-[#fef3c7] border-4 border-amber-300 p-6 sm:p-10 shadow-xl text-center overflow-hidden">
        
        {/* Decorative Scroll Knobs */}
        <div className="absolute top-4 left-4 w-6 h-6 rounded-full bg-amber-500 border-2 border-white shadow-sm"></div>
        <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-amber-500 border-2 border-white shadow-sm"></div>

        {/* Banner Ribbon Title */}
        <div className="inline-block relative mb-3">
          <div className="px-8 py-2.5 bg-gradient-to-r from-pink-500 via-purple-600 to-pink-500 text-white font-black text-2xl sm:text-3xl rounded-full shadow-lg font-heading tracking-wide uppercase border-2 border-white">
            DAILY MISSIONS
          </div>
        </div>

        <p className="text-sm font-bold text-amber-950 mt-1">
          {completedCount}/5 Missions Completed • Win Bonus Coins & XP!
        </p>

        {/* Progress Bar */}
        <div className="max-w-md mx-auto my-4 bg-amber-200/80 h-3 rounded-full overflow-hidden p-0.5 border border-amber-400">
          <div
            className="h-full bg-gradient-to-r from-pink-500 to-purple-600 rounded-full transition-all duration-500"
            style={{ width: `${(completedCount / 5) * 100}%` }}
          ></div>
        </div>

        {/* Mission Cards Grid matching Screenshot 131345.png */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mt-8">
          {missions.map((m) => {
            const isDone = profile.completedMissions?.[m.key];
            return (
              <div
                key={m.key}
                className={`p-4 rounded-2xl border-2 flex flex-col justify-between text-center transition-all bg-white shadow-sm ${
                  isDone ? 'border-emerald-400 ring-2 ring-emerald-200' : 'border-amber-200 hover:border-amber-400'
                }`}
              >
                <div>
                  <div className="w-12 h-12 rounded-full bg-amber-100 mx-auto flex items-center justify-center text-2xl shadow-inner mb-2">
                    {m.icon}
                  </div>
                  <h4 className="font-black text-slate-900 text-xs font-heading">{m.title}</h4>
                  <p className="text-[10px] text-slate-500 mt-1 line-clamp-2 leading-tight">
                    {m.desc}
                  </p>
                </div>

                <div className="mt-4 pt-2 border-t border-slate-100">
                  {isDone ? (
                    <div className="py-1 px-2 bg-emerald-50 text-emerald-700 font-black text-[11px] rounded-full flex items-center justify-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>DONE!</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        soundManager.playPop();
                        setActiveTab(m.targetTab);
                      }}
                      className="btn-fun w-full py-1.5 px-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-[11px] rounded-full shadow-xs flex items-center justify-center gap-1"
                    >
                      <Coins className="w-3 h-3 fill-amber-500" />
                      <span>Collect 1,000</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

      </div>

    </div>
  );
}
