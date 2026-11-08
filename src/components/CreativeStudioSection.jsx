import React, { useState } from 'react';
import { Palette, Grid, Sparkles, Wand2 } from 'lucide-react';
import DrawingStudio from './creative/DrawingStudio';
import PixelArtStudio from './creative/PixelArtStudio';
import { soundManager } from '../utils/soundEffects';

export default function CreativeStudioSection({ profile, onProfileUpdate }) {
  const [activeStudio, setActiveStudio] = useState('drawing'); // 'drawing' | 'pixel'

  return (
    <div className="space-y-8 pb-16">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-pink-100 text-pink-800 rounded-full text-xs font-bold mb-2">
            <Palette className="w-3.5 h-3.5" />
            <span>ZUNO Creative Studio</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-heading">
            Doodle, Paint & Create
          </h1>
          <p className="text-sm text-slate-500 font-medium">
            Express yourself with freehand sketch tools and retro pixel-art sprite creators!
          </p>
        </div>

        {/* Tab switch buttons */}
        <div className="inline-flex p-1 bg-white border border-slate-200 rounded-2xl shadow-xs self-start md:self-auto">
          <button
            onClick={() => {
              soundManager.playPop();
              setActiveStudio('drawing');
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeStudio === 'drawing'
                ? 'bg-amber-400 text-slate-950 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Palette className="w-4 h-4" />
            <span>Drawing Canvas</span>
          </button>
          <button
            onClick={() => {
              soundManager.playPop();
              setActiveStudio('pixel');
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeStudio === 'pixel'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Grid className="w-4 h-4" />
            <span>Pixel Art Studio</span>
          </button>
        </div>
      </div>

      {/* Active Studio View */}
      <div>
        {activeStudio === 'drawing' ? (
          <DrawingStudio profile={profile} onProfileUpdate={onProfileUpdate} />
        ) : (
          <PixelArtStudio onProfileUpdate={onProfileUpdate} />
        )}
      </div>

    </div>
  );
}
