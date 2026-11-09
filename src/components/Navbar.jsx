import React, { useState } from 'react';
import { Gamepad2, Volume2, VolumeX, Sparkles, Trophy, Palette, Users, Search, Award, Coins } from 'lucide-react';
import { soundManager } from '../utils/soundEffects';

export default function Navbar({ activeTab, setActiveTab, profile, onOpenAuth, onSelectGame }) {
  const [muted, setMuted] = useState(soundManager.muted);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleSound = () => {
    const isMuted = soundManager.toggleMute();
    setMuted(isMuted);
    if (!isMuted) {
      soundManager.playPop();
    }
  };

  const navItems = [
    { id: 'home', label: 'Home', icon: Sparkles },
    { id: 'games', label: 'Games', icon: Gamepad2, badge: '12' },
    { id: 'quiz', label: 'Quiz World', icon: Trophy },
    { id: 'ai', label: 'AI Fun', icon: Sparkles },
    { id: 'creative', label: 'Creative Studio', icon: Palette },
    { id: 'community', label: 'Community', icon: Users },
  ];

  const handleNavClick = (id) => {
    soundManager.playClick();
    setActiveTab(id);
    setMobileMenuOpen(false);
  };

  const handleSearchSubmit = () => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return;

    if (q.includes('bubble')) {
      if (onSelectGame) onSelectGame('bubble');
      else setActiveTab('games');
    } else if (q.includes('dash') || q.includes('run')) {
      if (onSelectGame) onSelectGame('dash');
      else setActiveTab('games');
    } else if (q.includes('whack') || q.includes('mole')) {
      if (onSelectGame) onSelectGame('whack');
      else setActiveTab('games');
    } else if (q.includes('crush') || q.includes('candy') || q.includes('fruit')) {
      if (onSelectGame) onSelectGame('colorcrush');
      else setActiveTab('games');
    } else if (q.includes('maze') || q.includes('escape')) {
      if (onSelectGame) onSelectGame('maze');
      else setActiveTab('games');
    } else if (q.includes('battle') || q.includes('brain')) {
      if (onSelectGame) onSelectGame('brainbattle');
      else setActiveTab('games');
    } else if (q.includes('block')) {
      if (onSelectGame) onSelectGame('block');
      else setActiveTab('games');
    } else if (q.includes('space') || q.includes('ship')) {
      if (onSelectGame) onSelectGame('space');
      else setActiveTab('games');
    } else if (q.includes('beat') || q.includes('rhythm')) {
      if (onSelectGame) onSelectGame('beat');
      else setActiveTab('games');
    } else if (q.includes('guess') || q.includes('party')) {
      if (onSelectGame) onSelectGame('drawguess');
      else setActiveTab('games');
    } else if (q.includes('tic') || q.includes('xo')) {
      if (onSelectGame) onSelectGame('tictactoe');
      else setActiveTab('games');
    } else if (q.includes('memory') || q.includes('flip')) {
      if (onSelectGame) onSelectGame('memory');
      else setActiveTab('games');
    } else if (q.includes('snake')) {
      if (onSelectGame) onSelectGame('snake');
      else setActiveTab('games');
    } else if (q.includes('game') || q.includes('arcade')) {
      setActiveTab('games');
    } else if (q.includes('quiz') || q.includes('spin') || q.includes('would')) {
      setActiveTab('quiz');
    } else if (q.includes('ai') || q.includes('idea')) {
      setActiveTab('ai');
    } else if (q.includes('draw') || q.includes('pixel') || q.includes('art')) {
      setActiveTab('creative');
    } else if (q.includes('quest') || q.includes('leader') || q.includes('music')) {
      setActiveTab('community');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-amber-100 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Brand Logo - Styled exactly after screenshot 131145.png & 134819.png */}
          <div 
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 via-pink-400 to-indigo-500 p-0.5 shadow-md shadow-indigo-100 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center relative overflow-hidden">
                <span className="text-2xl animate-float">🪐</span>
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                </span>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-3xl font-extrabold tracking-tight text-slate-900 font-heading">
                  ZU<span className="text-amber-500">NO</span>
                </span>
                <span className="text-xs px-2 py-0.5 bg-amber-100 text-amber-800 font-bold rounded-full">
                  FUNPLAY
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium tracking-wide">YOUR UNIVERSE OF FUN</p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1.5 bg-slate-50/80 p-1.5 rounded-full border border-slate-200/70">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all duration-200 ${
                    isActive
                      ? 'bg-amber-400 text-slate-950 shadow-sm shadow-amber-200 scale-102'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-rose-500 text-white font-black animate-pulse">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Search Bar + Controls + Profile Badge */}
          <div className="hidden lg:flex items-center gap-3">
            {/* Quick Search Bar */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search games, quizzes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSearchSubmit();
                }}
                className="w-44 pl-9 pr-4 py-2 bg-slate-100 hover:bg-slate-50 focus:bg-white border border-transparent focus:border-amber-300 rounded-full text-xs font-medium focus:outline-none focus:w-56 transition-all"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </div>

            {/* Sound Toggle (Ambient & FX) */}
            <button
              onClick={toggleSound}
              title={muted ? "Unmute audio" : "Mute audio"}
              className="p-2.5 rounded-full bg-slate-100 hover:bg-amber-100 text-slate-600 hover:text-amber-800 transition-colors"
            >
              {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-emerald-600" />}
            </button>

            {/* Coins & Level Pill */}
            <div 
              onClick={onOpenAuth}
              className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-200/80 rounded-full cursor-pointer hover:bg-amber-100 transition-colors"
            >
              <div className="flex items-center gap-1 text-amber-700 font-bold text-xs">
                <Coins className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                <span>{profile.coins.toLocaleString()}</span>
              </div>
              <span className="w-1 h-1 bg-amber-300 rounded-full"></span>
              <div className="text-xs font-bold text-slate-700">
                Lvl {profile.level}
              </div>
            </div>

            {/* Player Avatar */}
            <button
              onClick={onOpenAuth}
              className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-500 p-0.5 shadow-sm hover:scale-105 transition-transform"
            >
              <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center text-lg">
                {profile.avatar || '🦊'}
              </div>
            </button>
          </div>

          {/* Mobile hamburger menu toggle */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={toggleSound}
              className="p-2 rounded-xl bg-slate-100 text-slate-700"
            >
              {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-emerald-600" />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-xl bg-slate-100 text-slate-800 font-bold text-sm"
            >
              ☰
            </button>
          </div>

        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-slate-100 space-y-2 animate-scale-in">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-bold ${
                    isActive ? 'bg-amber-400 text-slate-950' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500 text-white font-bold">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}

      </div>
    </header>
  );
}
