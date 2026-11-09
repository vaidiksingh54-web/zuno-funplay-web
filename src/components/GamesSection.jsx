import React, { useState } from 'react';
import { 
  Gamepad2, Brain, Sparkles, Swords, Trophy, Flame, 
  CircleDot, Footprints, Hammer, Grid3X3, Rocket, Music, Palette, Users
} from 'lucide-react';
import TicTacToe from './games/TicTacToe';
import MemoryGame from './games/MemoryGame';
import SnakeGame from './games/SnakeGame';
import ArcadeGames from './games/ArcadeGames';
import BubblePop from './games/BubblePop';
import DashRush from './games/DashRush';
import WhackAttack from './games/WhackAttack';
import BlockMania from './games/BlockMania';
import SpaceSurvivor from './games/SpaceSurvivor';
import BeatMaster from './games/BeatMaster';
import DrawAndGuess from './games/DrawAndGuess';
import { soundManager } from '../utils/soundEffects';

export default function GamesSection({ profile, onProfileUpdate }) {
  const [activeGame, setActiveGame] = useState('bubble');
  const [activeCategory, setActiveCategory] = useState('all');

  const allGames = [
    {
      id: 'bubble',
      title: 'Bubble Pop',
      subtitle: 'Match-3 Bubble Shooter',
      category: 'puzzle',
      icon: CircleDot,
      badge: 'New Hot',
      color: 'bg-rose-500 text-white',
      cardBg: 'hover:border-rose-300',
    },
    {
      id: 'dash',
      title: 'Dash Rush',
      subtitle: '3-Lane Endless Runner',
      category: 'arcade',
      icon: Footprints,
      badge: 'Action',
      color: 'bg-amber-500 text-white',
      cardBg: 'hover:border-amber-300',
    },
    {
      id: 'whack',
      title: 'Whack Attack',
      subtitle: 'Reaction Speed Challenge',
      category: 'reaction',
      icon: Hammer,
      badge: 'Reflex',
      color: 'bg-orange-500 text-white',
      cardBg: 'hover:border-orange-300',
    },
    {
      id: 'block',
      title: 'Block Mania',
      subtitle: 'Grid Line Clear Puzzle',
      category: 'puzzle',
      icon: Grid3X3,
      badge: 'Puzzle',
      color: 'bg-indigo-500 text-white',
      cardBg: 'hover:border-indigo-300',
    },
    {
      id: 'space',
      title: 'Space Survivor',
      subtitle: 'Spaceship Asteroid Blaster',
      category: 'arcade',
      icon: Rocket,
      badge: 'Sci-Fi',
      color: 'bg-cyan-500 text-white',
      cardBg: 'hover:border-cyan-300',
    },
    {
      id: 'beat',
      title: 'Beat Master',
      subtitle: '4-Lane Rhythm Music',
      category: 'reaction',
      icon: Music,
      badge: 'Rhythm',
      color: 'bg-pink-500 text-white',
      cardBg: 'hover:border-pink-300',
    },
    {
      id: 'drawguess',
      title: 'Draw & Guess',
      subtitle: 'Multiplayer Party Game',
      category: 'multiplayer',
      icon: Palette,
      badge: 'Multiplayer',
      color: 'bg-purple-500 text-white',
      cardBg: 'hover:border-purple-300',
    },
    {
      id: 'tictactoe',
      title: 'XO Arena',
      subtitle: 'Classic 3x3 Duels & AI',
      category: 'multiplayer',
      icon: Swords,
      badge: '2-Player',
      color: 'bg-emerald-500 text-white',
      cardBg: 'hover:border-emerald-300',
    },
    {
      id: 'memory',
      title: 'Memory Flip',
      subtitle: 'Animal Card Matching',
      category: 'puzzle',
      icon: Brain,
      badge: 'Brain Boost',
      color: 'bg-teal-500 text-white',
      cardBg: 'hover:border-teal-300',
    },
    {
      id: 'snake',
      title: 'Slither Snake',
      subtitle: 'Grow & Dodge Arena',
      category: 'arcade',
      icon: Flame,
      badge: 'Leaderboard',
      color: 'bg-emerald-600 text-white',
      cardBg: 'hover:border-emerald-300',
    },
    {
      id: 'arcade',
      title: 'Classic Arcade',
      subtitle: 'Flappy Flyer & Space Pong',
      category: 'arcade',
      icon: Gamepad2,
      badge: 'Retro',
      color: 'bg-slate-700 text-white',
      cardBg: 'hover:border-slate-400',
    },
  ];

  const categories = [
    { id: 'all', label: 'All Games (11)' },
    { id: 'arcade', label: 'Arcade & Action' },
    { id: 'puzzle', label: 'Puzzles & Brain' },
    { id: 'reaction', label: 'Reaction & Rhythm' },
    { id: 'multiplayer', label: 'Multiplayer & Social' },
  ];

  const filteredGames = activeCategory === 'all'
    ? allGames
    : allGames.filter(g => g.category === activeCategory);

  return (
    <div className="space-y-8 pb-16">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-bold mb-2">
            <Gamepad2 className="w-3.5 h-3.5" />
            <span>ZUNO Gaming Universe</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-heading">
            Instant Play Games & Challenges
          </h1>
          <p className="text-sm text-slate-500 font-medium">
            Compete, challenge friends in 2-Player modes, and climb the daily leaderboard!
          </p>
        </div>

        {/* Player score status */}
        <div className="flex items-center gap-3 bg-white p-2.5 rounded-2xl border border-slate-200 shadow-xs self-start md:self-auto">
          <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center text-lg">
            🏆
          </div>
          <div className="text-xs">
            <div className="text-slate-400 font-semibold">PLAYER LEVEL</div>
            <div className="text-slate-900 font-black">Level {profile.level} ({profile.xp} XP)</div>
          </div>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => {
              soundManager.playClick();
              setActiveCategory(c.id);
            }}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
              activeCategory === c.id
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Game Selector Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
        {filteredGames.map((g) => {
          const Icon = g.icon;
          const isSelected = activeGame === g.id;
          return (
            <button
              key={g.id}
              onClick={() => {
                soundManager.playPop();
                setActiveGame(g.id);
              }}
              className={`p-3.5 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between ${
                isSelected
                  ? 'bg-white border-amber-400 shadow-md shadow-amber-100 -translate-y-1 ring-2 ring-amber-400/40'
                  : `bg-white/80 border-slate-200 hover:bg-white ${g.cardBg}`
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-xs ${g.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                  {g.badge}
                </span>
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-xs font-heading truncate">{g.title}</h3>
                <p className="text-[10px] text-slate-500 font-medium truncate">{g.subtitle}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Game Display Area */}
      <div className="pt-2">
        {activeGame === 'bubble' && <BubblePop onProfileUpdate={onProfileUpdate} />}
        {activeGame === 'dash' && <DashRush onProfileUpdate={onProfileUpdate} />}
        {activeGame === 'whack' && <WhackAttack onProfileUpdate={onProfileUpdate} />}
        {activeGame === 'block' && <BlockMania onProfileUpdate={onProfileUpdate} />}
        {activeGame === 'space' && <SpaceSurvivor onProfileUpdate={onProfileUpdate} />}
        {activeGame === 'beat' && <BeatMaster onProfileUpdate={onProfileUpdate} />}
        {activeGame === 'drawguess' && <DrawAndGuess onProfileUpdate={onProfileUpdate} />}
        {activeGame === 'tictactoe' && <TicTacToe onProfileUpdate={onProfileUpdate} />}
        {activeGame === 'memory' && <MemoryGame onProfileUpdate={onProfileUpdate} />}
        {activeGame === 'snake' && <SnakeGame onProfileUpdate={onProfileUpdate} />}
        {activeGame === 'arcade' && <ArcadeGames onProfileUpdate={onProfileUpdate} />}
      </div>

    </div>
  );
}
