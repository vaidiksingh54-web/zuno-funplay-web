import React, { useState } from 'react';
import { X, User, Award, Coins, Flame, Save, Sparkles } from 'lucide-react';
import { soundManager } from '../utils/soundEffects';
import { saveProfile } from '../utils/storage';

const AVATARS = ['🎮', '👾', '🚀', '🧙‍♂️', '🐱', '🦊', '🎨', '⚡'];

export default function AuthModal({ isOpen, onClose, profile, setProfile }) {
  const [username, setUsername] = useState(profile.username || 'Alex');
  const [selectedAvatar, setSelectedAvatar] = useState(profile.avatar || '🎮');

  if (!isOpen) return null;

  const handleSave = (e) => {
    e.preventDefault();
    soundManager.playWin();
    const updated = {
      ...profile,
      username: username.trim() || 'Alex',
      avatar: selectedAvatar,
    };
    saveProfile(updated);
    setProfile(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-amber-100 relative overflow-hidden animate-scale">
        
        {/* Close Button */}
        <button
          onClick={() => {
            soundManager.playClick();
            onClose();
          }}
          className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-1 mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-400 to-pink-500 mx-auto flex items-center justify-center text-3xl shadow-md mb-3">
            {selectedAvatar}
          </div>
          <h3 className="text-2xl font-black text-slate-900 font-heading">Player Profile</h3>
          <p className="text-xs text-slate-500">Your ZUNO Explorer Identity</p>
        </div>

        {/* Profile Stats Summary */}
        <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-200/80 mb-6 text-center">
          <div>
            <div className="text-[10px] text-slate-400 font-bold uppercase">LEVEL</div>
            <div className="text-base font-black text-indigo-600 font-heading">Lv. {profile.level}</div>
          </div>
          <div className="border-x border-slate-200">
            <div className="text-[10px] text-slate-400 font-bold uppercase">COINS</div>
            <div className="text-base font-black text-amber-600 font-heading">{profile.coins.toLocaleString()}</div>
          </div>
          <div>
            <div className="text-[10px] text-slate-400 font-bold uppercase">XP</div>
            <div className="text-base font-black text-emerald-600 font-heading">{profile.xp.toLocaleString()}</div>
          </div>
        </div>

        {/* Customization Form */}
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5">Player Name</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:border-amber-400"
              maxLength={20}
              placeholder="Enter name..."
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5">Choose Avatar</label>
            <div className="grid grid-cols-4 gap-2">
              {AVATARS.map((av) => (
                <button
                  type="button"
                  key={av}
                  onClick={() => {
                    soundManager.playPop();
                    setSelectedAvatar(av);
                  }}
                  className={`p-2.5 rounded-xl border text-xl flex items-center justify-center transition-all ${
                    selectedAvatar === av
                      ? 'bg-amber-100 border-amber-400 scale-105 shadow-xs'
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {av}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="btn-fun w-full py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-xl text-sm shadow-md"
            >
              Save Profile
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
