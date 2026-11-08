import React, { useState } from 'react';
import { Trophy, HelpCircle, Sparkles, Award } from 'lucide-react';
import TriviaQuiz from './quiz/TriviaQuiz';
import WouldYouRather from './quiz/WouldYouRather';
import LuckyWheel from './quiz/LuckyWheel';
import { soundManager } from '../utils/soundEffects';

export default function QuizWorldSection({ profile, onProfileUpdate }) {
  const [activeSubTab, setActiveSubTab] = useState('trivia'); // 'trivia' | 'wouldyourather' | 'wheel'

  const subTabs = [
    {
      id: 'trivia',
      label: 'Daily Trivia Quiz',
      icon: Trophy,
      desc: 'Test your brain & score points',
      color: 'bg-amber-400 text-slate-950',
    },
    {
      id: 'wouldyourather',
      label: 'Would You Rather?',
      icon: HelpCircle,
      desc: 'Hilarious dilemmas & voting',
      color: 'bg-indigo-600 text-white',
    },
    {
      id: 'wheel',
      label: 'Spin The Lucky Wheel',
      icon: Sparkles,
      desc: 'Spin for daily coin prizes',
      color: 'bg-purple-600 text-white',
    },
  ];

  return (
    <div className="space-y-8 pb-16">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold mb-2">
            <Trophy className="w-3.5 h-3.5" />
            <span>ZUNO Quiz World</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-heading">
            Test Your Knowledge & Luck
          </h1>
          <p className="text-sm text-slate-500 font-medium">
            Challenge yourself with interactive daily quizzes, social dilemmas, and lucky prize spins!
          </p>
        </div>

        {/* Diamond / Coin balance indicator from Screenshot 134940.png */}
        <div className="flex items-center gap-2 px-4 py-2 bg-purple-50 border border-purple-200 rounded-2xl self-start md:self-auto">
          <span className="text-xl">💎</span>
          <div>
            <div className="text-[10px] text-purple-600 font-bold uppercase">QUIZ POINTS</div>
            <div className="text-sm font-black text-purple-900">{profile.xp.toLocaleString()} XP</div>
          </div>
        </div>
      </div>

      {/* Mode Navigation Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {subTabs.map((tab) => {
          const Icon = tab.icon;
          const isSelected = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                soundManager.playPop();
                setActiveSubTab(tab.id);
              }}
              className={`p-4 rounded-2xl border text-left transition-all duration-200 flex items-center gap-3.5 ${
                isSelected
                  ? 'bg-white border-amber-400 shadow-md ring-2 ring-amber-400/30 -translate-y-0.5'
                  : 'bg-white/70 border-slate-200 hover:bg-white hover:border-slate-300'
              }`}
            >
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${tab.color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm font-heading">{tab.label}</h3>
                <p className="text-xs text-slate-500 font-medium">{tab.desc}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Component */}
      <div className="pt-2">
        {activeSubTab === 'trivia' && <TriviaQuiz onProfileUpdate={onProfileUpdate} />}
        {activeSubTab === 'wouldyourather' && <WouldYouRather onProfileUpdate={onProfileUpdate} />}
        {activeSubTab === 'wheel' && <LuckyWheel onProfileUpdate={onProfileUpdate} />}
      </div>

    </div>
  );
}
