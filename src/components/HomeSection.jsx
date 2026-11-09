import React from 'react';
import { 
  Gamepad2, Trophy, Sparkles, Palette, Users, ArrowRight, Brain, 
  HelpCircle, Star, Flame, Award, ChevronRight, Play, CheckCircle2, Gift,
  CircleDot, Footprints, Hammer, Grid3X3, Rocket, Music, Swords, Compass, Zap
} from 'lucide-react';
import { soundManager } from '../utils/soundEffects';

export default function HomeSection({ setActiveTab, profile, onOpenAuth, onSelectGame }) {
  const quickCategories = [
    {
      id: 'games',
      title: 'Games',
      desc: 'Play 12 exciting games',
      icon: Gamepad2,
      color: 'from-blue-500 to-indigo-600',
      bgColor: 'bg-blue-50 hover:bg-blue-100/80',
      badgeColor: 'bg-blue-600 text-white',
    },
    {
      id: 'quiz',
      title: 'Quiz World',
      desc: 'Test your knowledge',
      icon: Trophy,
      color: 'from-emerald-400 to-teal-600',
      bgColor: 'bg-emerald-50 hover:bg-emerald-100/80',
      badgeColor: 'bg-emerald-600 text-white',
    },
    {
      id: 'ai',
      title: 'AI Fun',
      desc: 'Explore AI tools',
      icon: Sparkles,
      color: 'from-amber-400 to-orange-500',
      bgColor: 'bg-amber-50 hover:bg-amber-100/80',
      badgeColor: 'bg-amber-500 text-white',
    },
    {
      id: 'creative',
      title: 'Creative Studio',
      desc: 'Create something new',
      icon: Palette,
      color: 'from-purple-400 to-pink-500',
      bgColor: 'bg-purple-50 hover:bg-purple-100/80',
      badgeColor: 'bg-purple-600 text-white',
    },
    {
      id: 'community',
      title: 'Community',
      desc: 'Connect with others',
      icon: Users,
      color: 'from-teal-400 to-cyan-600',
      bgColor: 'bg-teal-50 hover:bg-teal-100/80',
      badgeColor: 'bg-teal-600 text-white',
    },
  ];

  const featuredGames = [
    {
      id: 'bubble',
      title: 'Bubble Pop',
      subtitle: 'Match-3 Shooter',
      badge: 'Hot',
      icon: CircleDot,
      color: 'bg-rose-500 text-white',
      cardBg: 'from-rose-50 to-orange-50/60 border-rose-200',
    },
    {
      id: 'dash',
      title: 'Dash Rush',
      subtitle: '3-Lane Runner',
      badge: 'Action',
      icon: Footprints,
      color: 'bg-amber-500 text-white',
      cardBg: 'from-amber-50 to-yellow-50/60 border-amber-200',
    },
    {
      id: 'whack',
      title: 'Whack Attack',
      subtitle: 'Reaction Speed',
      badge: 'Reflex',
      icon: Hammer,
      color: 'bg-orange-500 text-white',
      cardBg: 'from-orange-50 to-amber-50/60 border-orange-200',
    },
    {
      id: 'colorcrush',
      title: 'Color Crush',
      subtitle: 'Candy Cascade Match-3',
      badge: 'Match-3',
      icon: Sparkles,
      color: 'bg-pink-500 text-white',
      cardBg: 'from-pink-50 to-rose-50/60 border-pink-200',
    },
    {
      id: 'maze',
      title: 'Maze Escape',
      subtitle: 'Dungeon Key & Traps',
      badge: 'Adventure',
      icon: Compass,
      color: 'bg-emerald-600 text-white',
      cardBg: 'from-emerald-50 to-teal-50/60 border-emerald-200',
    },
    {
      id: 'brainbattle',
      title: 'Brain Battle',
      subtitle: '1v1 Live Quiz Arena',
      badge: '1v1 Duel',
      icon: Zap,
      color: 'bg-violet-600 text-white',
      cardBg: 'from-violet-50 to-indigo-50/60 border-violet-200',
    },
    {
      id: 'block',
      title: 'Block Mania',
      subtitle: 'Line Clear Blast',
      badge: 'Puzzle',
      icon: Grid3X3,
      color: 'bg-indigo-500 text-white',
      cardBg: 'from-indigo-50 to-blue-50/60 border-indigo-200',
    },
    {
      id: 'space',
      title: 'Space Survivor',
      subtitle: 'Asteroid Dodging',
      badge: 'Sci-Fi',
      icon: Rocket,
      color: 'bg-cyan-500 text-white',
      cardBg: 'from-cyan-50 to-sky-50/60 border-cyan-200',
    },
    {
      id: 'beat',
      title: 'Beat Master',
      subtitle: '4-Lane Rhythm Music',
      badge: 'Rhythm',
      icon: Music,
      color: 'bg-fuchsia-500 text-white',
      cardBg: 'from-fuchsia-50 to-pink-50/60 border-fuchsia-200',
    },
    {
      id: 'drawguess',
      title: 'Draw & Guess',
      subtitle: 'Multiplayer Party',
      badge: 'Party',
      icon: Palette,
      color: 'bg-purple-500 text-white',
      cardBg: 'from-purple-50 to-indigo-50/60 border-purple-200',
    },
    {
      id: 'tictactoe',
      title: 'XO Arena',
      subtitle: 'Classic Duels & AI',
      badge: '2-Player',
      icon: Swords,
      color: 'bg-emerald-500 text-white',
      cardBg: 'from-emerald-50 to-teal-50/60 border-emerald-200',
    },
    {
      id: 'memory',
      title: 'Memory Flip',
      subtitle: 'Card Pair Match',
      badge: 'Brain',
      icon: Brain,
      color: 'bg-teal-500 text-white',
      cardBg: 'from-teal-50 to-cyan-50/60 border-teal-200',
    },
  ];

  const exploreCards = [
    {
      id: 'action',
      title: 'Action Games',
      icon: Gamepad2,
      targetTab: 'games',
      color: 'bg-[#8b5cf6] text-white',
      accent: 'hover:shadow-purple-200',
    },
    {
      id: 'brain',
      title: 'Brain Games',
      icon: Brain,
      targetTab: 'games',
      color: 'bg-[#6ee7b7] text-emerald-950',
      accent: 'hover:shadow-emerald-200',
    },
    {
      id: 'quiz-chlg',
      title: 'Quiz Challenges',
      icon: HelpCircle,
      targetTab: 'quiz',
      color: 'bg-[#fcd34d] text-amber-950',
      accent: 'hover:shadow-amber-200',
    },
    {
      id: 'creative-tools',
      title: 'Creative Tools',
      icon: Palette,
      targetTab: 'creative',
      color: 'bg-[#67e8f9] text-cyan-950',
      accent: 'hover:shadow-cyan-200',
    },
    {
      id: 'fun-act',
      title: 'Fun Activities',
      icon: Star,
      targetTab: 'community',
      color: 'bg-[#fda4af] text-rose-950',
      accent: 'hover:shadow-rose-200',
    },
  ];

  const handleCardClick = (tab) => {
    soundManager.playPop();
    setActiveTab(tab);
  };

  const handleGameLaunch = (gameId) => {
    soundManager.playPop();
    if (onSelectGame) {
      onSelectGame(gameId);
    } else {
      setActiveTab('games');
    }
  };

  return (
    <div className="space-y-12 pb-16">
      
      {/* Hero Section — Styled after screenshot 134819.png */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-50/90 via-orange-50/50 to-indigo-50/60 border border-amber-100 p-8 sm:p-12 lg:p-16 shadow-sm">
        
        {/* Subtle decorative background bubbles */}
        <div className="absolute -top-12 -right-12 w-80 h-80 bg-amber-200/40 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-12 -left-12 w-80 h-80 bg-purple-200/40 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column: Heading & CTA */}
          <div className="lg:col-span-7 space-y-6">
            
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-100/80 border border-amber-200 text-amber-900 text-xs font-bold">
              <Flame className="w-4 h-4 text-amber-500 fill-amber-400" />
              <span>Welcome to ZUNO 1.0 — Your Fun Playground</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.1] font-heading">
              Turn Boring Time <br />
              Into <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 via-orange-500 to-pink-500">Fun Time</span>
            </h1>

            <p className="text-lg text-slate-600 max-w-xl font-medium leading-relaxed">
              Play 12 instant games, compete in 2-Player friend challenges, take daily quizzes, and unleash your creativity!
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={() => {
                  soundManager.playPop();
                  setActiveTab('games');
                }}
                className="btn-fun inline-flex items-center gap-3 px-8 py-4 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-2xl font-black text-base transition-all shadow-md shadow-amber-200/80"
              >
                <span>Play Games (12)</span>
                <ArrowRight className="w-5 h-5" />
              </button>

              <button
                onClick={() => {
                  soundManager.playClick();
                  setActiveTab('quiz');
                }}
                className="inline-flex items-center gap-2 px-6 py-4 bg-white/90 hover:bg-white text-slate-700 hover:text-slate-900 rounded-2xl font-bold text-base border border-slate-200 transition-all shadow-sm"
              >
                <Trophy className="w-5 h-5 text-amber-500" />
                <span>Daily Quiz</span>
              </button>
            </div>

            {/* Quick stats ribbon */}
            <div className="pt-4 flex flex-wrap items-center gap-6 text-xs text-slate-500 font-semibold border-t border-amber-200/60">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="font-bold text-slate-800">12 Playable Instant Games</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
                <span>2-Player Friend Duels</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-pink-500"></span>
                <span>Daily Quests & Leaderboard</span>
              </div>
            </div>

          </div>

          {/* Right Column: Hero Illustration Matching 134819.png */}
          <div className="lg:col-span-5 flex justify-center relative">
            <div className="relative w-full max-w-md aspect-square rounded-3xl bg-gradient-to-tr from-amber-100/60 via-yellow-100/80 to-indigo-100/50 p-6 flex items-center justify-center border border-amber-200/60 shadow-inner">
              
              {/* Floating ambient badge elements */}
              <div className="absolute top-4 left-6 bg-white p-3 rounded-2xl shadow-md border border-slate-100 animate-float">
                <Gamepad2 className="w-7 h-7 text-indigo-500" />
              </div>
              <div className="absolute top-8 right-6 bg-white p-3 rounded-2xl shadow-md border border-slate-100 animate-float" style={{ animationDelay: '1s' }}>
                <Sparkles className="w-7 h-7 text-amber-500 fill-amber-300" />
              </div>
              <div className="absolute bottom-10 left-4 bg-white p-3 rounded-2xl shadow-md border border-slate-100 animate-float" style={{ animationDelay: '2s' }}>
                <Palette className="w-7 h-7 text-pink-500" />
              </div>
              <div className="absolute bottom-6 right-8 bg-white p-3 rounded-2xl shadow-md border border-slate-100 animate-float" style={{ animationDelay: '1.5s' }}>
                <Trophy className="w-7 h-7 text-emerald-500" />
              </div>

              {/* Central Beanbag Character Art Styled representation */}
              <div className="text-center space-y-4">
                <div className="relative inline-block">
                  <div className="w-48 h-48 sm:w-56 sm:h-56 rounded-full bg-amber-300 flex items-center justify-center shadow-lg border-4 border-white overflow-hidden relative">
                    <div className="absolute inset-0 bg-gradient-to-t from-amber-400 to-transparent"></div>
                    <span className="text-8xl select-none transform hover:scale-110 transition-transform">🛋️</span>
                    <span className="text-5xl absolute -top-1 right-12 animate-bounce">🕹️</span>
                  </div>
                  <div className="absolute -bottom-2 inset-x-0 mx-auto w-max px-4 py-1.5 bg-slate-900 text-white rounded-full text-xs font-bold shadow-md flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span>Ready for Play</span>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>

      </section>

      {/* 5 Quick Category Cards Directly Under Hero — From Screenshot 134819.png */}
      <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {quickCategories.map((cat) => {
          const Icon = cat.icon;
          return (
            <div
              key={cat.id}
              onClick={() => handleCardClick(cat.id)}
              className={`group cursor-pointer rounded-2xl p-5 border border-slate-200/80 transition-all duration-200 hover:-translate-y-1 hover:shadow-md ${cat.bgColor}`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-sm mb-4 ${cat.badgeColor} group-hover:scale-110 transition-transform`}>
                <Icon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 font-heading group-hover:text-amber-600 transition-colors">
                {cat.title}
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-1">
                {cat.desc}
              </p>
            </div>
          );
        })}
      </section>

      {/* 🎮 FEATURED INSTANT GAMES (12 Blueprint Games) SHOWCASED ON HOME */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="inline-flex items-center gap-1 text-xs font-extrabold text-amber-600 uppercase tracking-wider mb-1">
              <Flame className="w-3.5 h-3.5" />
              <span>Instant Play Arcade</span>
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 font-heading">
              12 Games to Play Right Now
            </h2>
            <p className="text-sm text-slate-500 font-medium">
              Click any game to launch and play immediately! Solo & 2-Player Duel modes.
            </p>
          </div>
          <button
            onClick={() => handleCardClick('games')}
            className="flex items-center gap-1 text-xs font-bold text-amber-600 hover:text-amber-700 group bg-amber-50 px-3.5 py-1.5 rounded-full border border-amber-200"
          >
            <span>View Arcade Hub</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        {/* 12 Game Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3.5">
          {featuredGames.map((game) => {
            const Icon = game.icon;
            return (
              <div
                key={game.id}
                onClick={() => handleGameLaunch(game.id)}
                className={`group cursor-pointer rounded-2xl p-4 border bg-gradient-to-b ${game.cardBg} transition-all duration-200 hover:-translate-y-1.5 hover:shadow-md flex flex-col justify-between`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-xs ${game.color} group-hover:scale-110 transition-transform`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-white/90 text-slate-700 shadow-2xs">
                      {game.badge}
                    </span>
                  </div>
                  <h3 className="font-extrabold text-slate-900 text-sm font-heading group-hover:text-amber-600 transition-colors truncate">
                    {game.title}
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium truncate mt-0.5">
                    {game.subtitle}
                  </p>
                </div>

                <div className="mt-4 pt-2.5 border-t border-slate-200/50 flex items-center justify-between text-xs font-bold text-slate-700 group-hover:text-amber-600">
                  <span className="text-[11px]">Play Now</span>
                  <div className="w-6 h-6 rounded-full bg-white shadow-2xs flex items-center justify-center group-hover:bg-amber-400 group-hover:text-slate-950 transition-all">
                    <Play className="w-3 h-3 fill-current ml-0.5" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Explore ZUNO Section — From Screenshot 134819.png */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 font-heading">Explore ZUNO</h2>
            <p className="text-sm text-slate-500 font-medium">Something for everyone, anytime!</p>
          </div>
          <button
            onClick={() => handleCardClick('games')}
            className="flex items-center gap-1 text-xs font-bold text-amber-600 hover:text-amber-700 group"
          >
            <span>View All</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {exploreCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.id}
                onClick={() => handleCardClick(card.targetTab)}
                className={`group cursor-pointer rounded-2xl p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg flex items-center justify-between ${card.color} ${card.accent}`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-white/20 backdrop-blur-sm group-hover:scale-110 transition-transform">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="font-bold text-base font-heading">
                    {card.title}
                  </span>
                </div>
                <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white/40 transition-colors">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Daily Missions & Quests Highlight (From screenshot 131345.png & 130941.png) */}
      <section className="bg-gradient-to-r from-amber-50 via-yellow-50 to-orange-50 border border-amber-200 rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-200/70 text-amber-900 rounded-full text-xs font-bold">
              <Gift className="w-3.5 h-3.5 text-amber-700" />
              <span>Daily Rewards Active</span>
            </div>
            <h3 className="text-2xl font-extrabold text-slate-900 font-heading">
              Complete Today's Fun Missions
            </h3>
            <p className="text-sm text-slate-600 max-w-lg">
              Earn coins, unlock badges, and level up your player profile by playing games and answering trivia questions.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => handleCardClick('community')}
              className="btn-fun px-6 py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-2xl text-sm transition-all shadow-sm"
            >
              Open Daily Quests
            </button>
            <button
              onClick={onOpenAuth}
              className="px-5 py-3 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-2xl text-sm border border-slate-200 shadow-sm"
            >
              View Player Card
            </button>
          </div>
        </div>
      </section>

    </div>
  );
}
