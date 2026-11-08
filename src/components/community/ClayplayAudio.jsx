import React, { useState, useEffect } from 'react';
import { Play, Pause, SkipForward, SkipBack, Shuffle, Volume2, VolumeX, Music, Sparkles } from 'lucide-react';
import { soundManager } from '../../utils/soundEffects';

const TRACKS = [
  { id: 1, title: 'Sunrise Mix', mood: 'Cozy Morning', icon: '🌅', color: 'from-amber-400 to-orange-300' },
  { id: 2, title: 'Deep Focus', mood: 'Study & Chill', icon: '🎧', color: 'from-emerald-400 to-teal-300' },
  { id: 3, title: 'Acoustic Chill', mood: 'Campfire Harmonies', icon: '🎸', color: 'from-orange-400 to-amber-200' },
  { id: 4, title: 'Wave Lounge', mood: 'Ocean Breezes', icon: '🌊', color: 'from-cyan-400 to-blue-300' },
  { id: 5, title: 'Mountain Calm', mood: 'Pine Forest Lo-Fi', icon: '🏔️', color: 'from-teal-400 to-emerald-200' },
];

export default function ClayplayAudio() {
  const [isPlaying, setIsPlaying] = useState(soundManager.ambientPlaying);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [volume, setVolume] = useState(soundManager.volume * 100);

  const currentTrack = TRACKS[currentTrackIndex];

  const togglePlay = () => {
    if (isPlaying) {
      soundManager.stopAmbientMusic();
      setIsPlaying(false);
    } else {
      soundManager.startAmbientMusic(currentTrack.title);
      setIsPlaying(true);
    }
  };

  const handleNextTrack = () => {
    soundManager.playClick();
    const nextIdx = (currentTrackIndex + 1) % TRACKS.length;
    setCurrentTrackIndex(nextIdx);
    if (isPlaying) {
      soundManager.startAmbientMusic(TRACKS[nextIdx].title);
    }
  };

  const handlePrevTrack = () => {
    soundManager.playClick();
    const prevIdx = (currentTrackIndex - 1 + TRACKS.length) % TRACKS.length;
    setCurrentTrackIndex(prevIdx);
    if (isPlaying) {
      soundManager.startAmbientMusic(TRACKS[prevIdx].title);
    }
  };

  const handleVolumeChange = (e) => {
    const val = Number(e.target.value);
    setVolume(val);
    soundManager.volume = val / 100;
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-gradient-to-br from-[#d1fae5] via-[#ecfdf5] to-[#f0fdf4] rounded-3xl p-6 sm:p-8 border-4 border-emerald-200 shadow-xl space-y-6">
      
      {/* Top Banner Styled after Clayplay / Screenshot 131618.png */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-rose-400 text-white flex items-center justify-center text-2xl shadow-md">
            🎵
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-2xl font-black text-slate-900 font-heading">Clayplay</h3>
              <span className="px-2.5 py-0.5 bg-emerald-200 text-emerald-900 rounded-full text-[10px] font-black uppercase tracking-wider">
                LO-FI LOUNGE
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Soothing ambient soundscapes generated in real-time with Web Audio API
            </p>
          </div>
        </div>

        <button
          onClick={togglePlay}
          className="btn-fun flex items-center gap-2 px-6 py-2.5 bg-rose-500 hover:bg-rose-400 text-white font-black text-xs rounded-full shadow-md self-start sm:self-auto"
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
          <span>{isPlaying ? 'Pause Lounge' : 'Play Ambient Vibes'}</span>
        </button>
      </div>

      {/* Playlist Grid matching Screenshot 131618.png */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {TRACKS.map((t, idx) => {
          const isSelected = currentTrackIndex === idx;
          return (
            <div
              key={t.id}
              onClick={() => {
                soundManager.playPop();
                setCurrentTrackIndex(idx);
                if (isPlaying) {
                  soundManager.startAmbientMusic(t.title);
                }
              }}
              className={`p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 flex flex-col justify-between text-center ${
                isSelected
                  ? 'bg-white border-emerald-500 shadow-md scale-102 ring-2 ring-emerald-300'
                  : 'bg-white/70 border-emerald-100 hover:bg-white hover:border-emerald-300'
              }`}
            >
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${t.color} mx-auto flex items-center justify-center text-3xl shadow-sm mb-3`}>
                {t.icon}
              </div>
              <h4 className="font-black text-slate-900 text-xs font-heading">{t.title}</h4>
              <p className="text-[10px] text-slate-500 font-medium mt-0.5">{t.mood}</p>
            </div>
          );
        })}
      </div>

      {/* Bottom Sticky Player Bar matching Screenshot 131618.png */}
      <div className="bg-white/90 backdrop-blur-md rounded-2xl p-4 border border-emerald-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Track Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-xl shadow-inner">
            {currentTrack.icon}
          </div>
          <div>
            <h5 className="font-black text-slate-900 text-xs font-heading">{currentTrack.title}</h5>
            <p className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
              <span className={`w-1.5 h-1.5 rounded-full ${isPlaying ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`}></span>
              <span>{isPlaying ? 'Now Playing Lo-Fi' : 'Ready to Relax'}</span>
            </p>
          </div>
        </div>

        {/* Player Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={handlePrevTrack}
            className="p-2 rounded-full hover:bg-slate-100 text-slate-600 transition-colors"
          >
            <SkipBack className="w-4 h-4" />
          </button>

          <button
            onClick={togglePlay}
            className="w-10 h-10 rounded-full bg-rose-500 hover:bg-rose-400 text-white flex items-center justify-center shadow-md transition-transform transform active:scale-95"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
          </button>

          <button
            onClick={handleNextTrack}
            className="p-2 rounded-full hover:bg-slate-100 text-slate-600 transition-colors"
          >
            <SkipForward className="w-4 h-4" />
          </button>
        </div>

        {/* Volume Slider */}
        <div className="flex items-center gap-2">
          <Volume2 className="w-4 h-4 text-slate-400" />
          <input
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={handleVolumeChange}
            className="w-24 accent-rose-500 cursor-pointer"
          />
        </div>

      </div>

    </div>
  );
}
