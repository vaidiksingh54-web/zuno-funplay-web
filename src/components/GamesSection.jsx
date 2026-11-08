import React, { useState } from 'react';
import { Gamepad2, Brain, Sparkles, Swords, Trophy, Flame } from 'lucide-react';
import TicTacToe from './games/TicTacToe';
import MemoryGame from './games/MemoryGame';
import SnakeGame from './games/SnakeGame';
import ArcadeGames from './games/ArcadeGames';
import { soundManager } from '../utils/soundEffects';

export default function GamesSection({ profile, onProfileUpdate }) {
  const [activeGame, setActiveGame] = useState('tictactoe');

  const gameList = [
    {
      id: 'tictactoe',
      title: 'Tic-Tac-Toe',
      subtitle: 'Classic 3x3 Duels',
      icon: Swords,
      badge: 'Popular',
      color: 'bg-rose-500 text-white',
      cardBg: 'hover:border-rose-300',
    },
    {
      id: 'memory',
      title: 'Match Pairs',
      subtitle: 'Animal Memory Cards',
      icon: Brain,
      badge: 'Brain Booster',
      color: 'bg-emerald-500 text-white',
      cardBg: 'hover:border-emerald-300',
    },
    {
      id: 'snake',
      title: 'Slither Snake',
      subtitle: 'Grow & Dodge Arena',
      icon: Flame,
      badge: 'Hot Arcade',
      color: 'bg-teal-500 text-white',
      cardBg: 'hover:border-teal-300',
    },
    {
      id: 'arcade',
      title: 'Retro Arcade',
      subtitle: 'Flappy & Space Pong',
      icon: Gamepad2,
      badge: 'Action',
      color: 'bg-amber-500 text-white',
      cardBg: 'hover:border-amber-300',
    },
  ];

  return (
    <div className="space-y-8 pb-16">
      
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-bold mb-2">
            <Gamepad2 className="w-3.5 h-3.5" />
            <span>ZUNO Game Arena</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-heading">
            Instant Play Arcade
          </h1>
          <p className="text-sm text-slate-500 font-medium">
            Jump straight into fun, fully playable games without downloads or logins!
          </p>
        </div>

        {/* Player mini score tag */}
        <div className="flex items-center gap-3 bg-white p-2.5 rounded-2xl border border-slate-200 shadow-xs self-start md:self-auto">
          <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center text-lg">
            🏆
          </div>
          <div className="text-xs">
            <div className="text-slate-400 font-semibold">GAMES PLAYED</div>
            <div className="text-slate-900 font-black">{profile.gamesPlayed || 47} Matches</div>
          </div>
        </div>
      </div>

      {/* Game Selector Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {gameList.map((g) => {
          const Icon = g.icon;
          const isSelected = activeGame === g.id;
          return (
            <button
              key={g.id}
              onClick={() => {
                soundManager.playPop();
                setActiveGame(g.id);
              }}
              className={`p-4 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between ${
                isSelected
                  ? 'bg-white border-amber-400 shadow-md shadow-amber-100 -translate-y-1 ring-2 ring-amber-400/30'
                  : `bg-white/80 border-slate-200 hover:bg-white ${g.cardBg}`
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-xs ${g.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                  {g.badge}
                </span>
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm font-heading">{g.title}</h3>
                <p className="text-[11px] text-slate-500 font-medium">{g.subtitle}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Game Display Area */}
      <div className="pt-2">
        {activeGame === 'tictactoe' && <TicTacToe onProfileUpdate={onProfileUpdate} />}
        {activeGame === 'memory' && <MemoryGame onProfileUpdate={onProfileUpdate} />}
        {activeGame === 'snake' && <SnakeGame onProfileUpdate={onProfileUpdate} />}
        {activeGame === 'arcade' && <ArcadeGames onProfileUpdate={onProfileUpdate} />}
      </div>

    </div>
  );
}
