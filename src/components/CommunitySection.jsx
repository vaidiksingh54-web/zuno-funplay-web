import React, { useState } from 'react';
import { Users, Award, Gift, Music, Trophy, Star, Shield, Flame } from 'lucide-react';
import DailyMissions from './community/DailyMissions';
import ClayplayAudio from './community/ClayplayAudio';
import { soundManager } from '../utils/soundEffects';

export default function CommunitySection({ profile, onProfileUpdate, setActiveTab }) {
  const [activeTab, setActiveSubTab] = useState('missions'); // 'missions' | 'leaderboard' | 'audio'

  const leaderboardUsers = [
    { rank: 1, name: 'Maktum Talukdar', title: 'Grandmaster', level: 32, xp: 18200, avatar: '🧙‍♂️', badge: 'Diamond' },
    { rank: 2, name: `${profile.username || 'Alex'} (You)`, title: profile.title || 'Legend', level: profile.level, xp: profile.xp, avatar: profile.avatar || '🎮', badge: 'Platinum' },
    { rank: 3, name: 'Jenny Wilson', title: 'Puzzle Queen', level: 25, xp: 11400, avatar: '👩‍🎤', badge: 'Gold' },
    { rank: 4, name: 'Robert Fox', title: 'Speed Demon', level: 22, xp: 9800, avatar: '🦊', badge: 'Silver' },
    { rank: 5, name: 'Jacob Jones', title: 'Art Prodigy', level: 19, xp: 8100, avatar: '🎨', badge: 'Bronze' },
  ];

  const badges = [
    { id: 1, title: 'Headshot Champion', desc: 'Achieved high score streak', icon: '🎯', unlocked: true },
    { id: 2, title: 'Loot Hunter', desc: 'Accumulated over 4,000 coins', icon: '💎', unlocked: profile.coins >= 4000 },
    { id: 3, title: 'Master of Fun', desc: 'Played across all 5 sections', icon: '⭐', unlocked: true },
    { id: 4, title: 'Daily Warrior', desc: 'Completed daily missions', icon: '⚔️', unlocked: Object.values(profile.completedMissions || {}).filter(Boolean).length >= 2 },
  ];

  return (
    <div className="space-y-8 pb-16">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-teal-100 text-teal-800 rounded-full text-xs font-bold mb-2">
            <Users className="w-3.5 h-3.5" />
            <span>ZUNO Hub & Quests</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-heading">
            Community, Quests & Audio
          </h1>
          <p className="text-sm text-slate-500 font-medium">
            Track daily missions, climb the leaderboards, and relax in the Lo-Fi sound lounge!
          </p>
        </div>

        {/* Navigation Switcher */}
        <div className="inline-flex p-1 bg-white border border-slate-200 rounded-2xl shadow-xs self-start md:self-auto">
          <button
            onClick={() => {
              soundManager.playPop();
              setActiveSubTab('missions');
            }}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'missions' ? 'bg-amber-400 text-slate-950 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Gift className="w-4 h-4" />
            <span>Daily Missions</span>
          </button>
          <button
            onClick={() => {
              soundManager.playPop();
              setActiveSubTab('leaderboard');
            }}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'leaderboard' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Trophy className="w-4 h-4" />
            <span>Leaderboard</span>
          </button>
          <button
            onClick={() => {
              soundManager.playPop();
              setActiveSubTab('audio');
            }}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'audio' ? 'bg-emerald-500 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Music className="w-4 h-4" />
            <span>Clayplay Audio</span>
          </button>
        </div>
      </div>

      {/* Sub Views */}
      <div>
        {activeTab === 'missions' && (
          <DailyMissions profile={profile} onProfileUpdate={onProfileUpdate} setActiveTab={setActiveTab} />
        )}

        {activeTab === 'leaderboard' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Top Players Table Styled after Screenshot 134940.png & 130941.png */}
            <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-md space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-xl font-black text-slate-900 font-heading flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-amber-500" />
                  <span>Top Player Rankings</span>
                </h3>
                <span className="text-xs font-bold text-slate-400">GLOBAL LEADERBOARD</span>
              </div>

              <div className="space-y-3">
                {leaderboardUsers.map((user) => (
                  <div
                    key={user.rank}
                    className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                      user.name.includes('(You)')
                        ? 'bg-amber-50/80 border-amber-300 ring-2 ring-amber-300/40 shadow-xs'
                        : 'bg-slate-50 border-slate-200/80 hover:bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <span className={`w-7 h-7 rounded-full flex items-center justify-center font-black text-xs ${
                        user.rank === 1 ? 'bg-amber-400 text-slate-950' :
                        user.rank === 2 ? 'bg-slate-300 text-slate-900' :
                        user.rank === 3 ? 'bg-amber-700 text-white' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {user.rank}
                      </span>
                      <div className="w-11 h-11 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-2xl shadow-xs">
                        {user.avatar}
                      </div>
                      <div>
                        <h4 className="font-black text-slate-900 text-sm font-heading">{user.name}</h4>
                        <p className="text-[11px] text-slate-500 font-medium">Lv. {user.level} • {user.title}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="font-black text-indigo-600 text-sm font-mono">
                        {user.xp.toLocaleString()} XP
                      </span>
                      <div className="text-[10px] text-slate-400 font-bold uppercase">{user.badge}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Achievements & Badges Panel */}
            <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-slate-200 shadow-md space-y-4">
              <div className="pb-3 border-b border-slate-100">
                <h3 className="text-lg font-black text-slate-900 font-heading flex items-center gap-2">
                  <Award className="w-5 h-5 text-indigo-500" />
                  <span>Your Badges</span>
                </h3>
                <p className="text-xs text-slate-500">Milestones unlocked on ZUNO</p>
              </div>

              <div className="space-y-3">
                {badges.map((b) => (
                  <div
                    key={b.id}
                    className={`p-3.5 rounded-2xl border flex items-center gap-3 transition-all ${
                      b.unlocked ? 'bg-indigo-50/70 border-indigo-200' : 'bg-slate-50 border-slate-200 opacity-50'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-xl shadow-xs shrink-0">
                      {b.icon}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-xs font-heading">{b.title}</h4>
                      <p className="text-[10px] text-slate-500">{b.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {activeTab === 'audio' && (
          <ClayplayAudio />
        )}
      </div>

    </div>
  );
}
