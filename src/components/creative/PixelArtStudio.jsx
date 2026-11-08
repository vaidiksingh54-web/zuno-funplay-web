import React, { useState } from 'react';
import { Pencil, Eraser, PaintBucket, Download, Trash2, Grid } from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundManager } from '../../utils/soundEffects';
import { addXPAndCoins } from '../../utils/storage';

const GRID_SIZE = 16;
const PIXEL_COLORS = [
  '#000000', '#ffffff', '#ef4444', '#f97316',
  '#facc15', '#22c55e', '#06b6d4', '#3b82f6',
  '#8b5cf6', '#ec4899', '#78350f', '#64748b',
];

export default function PixelArtStudio({ onProfileUpdate }) {
  const [pixels, setPixels] = useState(() => Array(GRID_SIZE * GRID_SIZE).fill('#ffffff'));
  const [color, setColor] = useState('#ef4444');
  const [tool, setTool] = useState('pencil'); // 'pencil' | 'eraser' | 'bucket'
  const [showGrid, setShowGrid] = useState(true);
  const [isMouseDown, setIsMouseDown] = useState(false);

  const applyColor = (index) => {
    soundManager.playClick();
    const newPixels = [...pixels];
    const targetColor = tool === 'eraser' ? '#ffffff' : color;

    if (tool === 'bucket') {
      const startColor = pixels[index];
      if (startColor === targetColor) return;
      floodFill(newPixels, index, startColor, targetColor);
    } else {
      newPixels[index] = targetColor;
    }

    setPixels(newPixels);
  };

  const floodFill = (grid, startIdx, startColor, fillCol) => {
    const queue = [startIdx];
    const visited = new Set();

    while (queue.length > 0) {
      const idx = queue.pop();
      if (visited.has(idx)) continue;
      visited.add(idx);

      if (grid[idx] === startColor) {
        grid[idx] = fillCol;
        const row = Math.floor(idx / GRID_SIZE);
        const col = idx % GRID_SIZE;

        if (row > 0) queue.push(idx - GRID_SIZE);
        if (row < GRID_SIZE - 1) queue.push(idx + GRID_SIZE);
        if (col > 0) queue.push(idx - 1);
        if (col < GRID_SIZE - 1) queue.push(idx + 1);
      }
    }
  };

  const handleMouseEnter = (index) => {
    if (isMouseDown && tool !== 'bucket') {
      applyColor(index);
    }
  };

  const handleClear = () => {
    soundManager.playClick();
    setPixels(Array(GRID_SIZE * GRID_SIZE).fill('#ffffff'));
  };

  const handleExportPNG = () => {
    soundManager.playWin();
    confetti({ particleCount: 50, spread: 50 });

    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    const pixelDim = 256 / GRID_SIZE;

    pixels.forEach((hex, i) => {
      const r = Math.floor(i / GRID_SIZE);
      const c = i % GRID_SIZE;
      ctx.fillStyle = hex;
      ctx.fillRect(c * pixelDim, r * pixelDim, pixelDim, pixelDim);
    });

    const link = document.createElement('a');
    link.download = `zuno-pixel-sprite-${Date.now()}.png`;
    link.href = canvas.toDataURL();
    link.click();

    const updated = addXPAndCoins(80, 150);
    if (onProfileUpdate) onProfileUpdate(updated);
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl">
      
      {/* Title & Top Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-800">
        <div>
          <h3 className="text-2xl font-black font-heading text-purple-400">
            PixelArt Studio
          </h3>
          <p className="text-xs text-slate-400">16x16 Retro Sprite Maker</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowGrid(!showGrid)}
            className={`p-2 rounded-xl border text-xs font-bold transition-colors ${
              showGrid ? 'bg-purple-600 text-white border-purple-500' : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
            title="Toggle Grid"
          >
            <Grid className="w-4 h-4" />
          </button>
          <button
            onClick={handleClear}
            className="p-2 rounded-xl bg-slate-800 hover:bg-rose-900/40 text-rose-400 border border-slate-700 text-xs font-bold transition-colors"
            title="Clear Canvas"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={handleExportPNG}
            className="btn-fun flex items-center gap-1.5 px-4 py-2 bg-purple-500 hover:bg-purple-400 text-white text-xs font-black rounded-xl shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Sprite</span>
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-center gap-8">
        
        {/* Tools & Palette */}
        <div className="space-y-4">
          <div className="flex gap-2">
            {[
              { id: 'pencil', icon: Pencil, label: 'Pencil' },
              { id: 'bucket', icon: PaintBucket, label: 'Fill' },
              { id: 'eraser', icon: Eraser, label: 'Eraser' },
            ].map(t => {
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  onClick={() => {
                    soundManager.playClick();
                    setTool(t.id);
                  }}
                  className={`p-2.5 rounded-xl border flex items-center gap-1.5 text-xs font-bold transition-all ${
                    tool === t.id
                      ? 'bg-purple-500 text-white border-purple-400 shadow-md'
                      : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{t.label}</span>
                </button>
              );
            })}
          </div>

          {/* Color swatches */}
          <div className="grid grid-cols-4 gap-2">
            {PIXEL_COLORS.map(c => (
              <button
                key={c}
                onClick={() => {
                  soundManager.playClick();
                  setColor(c);
                  if (tool === 'eraser') setTool('pencil');
                }}
                style={{ backgroundColor: c }}
                className={`w-8 h-8 rounded-lg border-2 transition-transform transform hover:scale-110 ${
                  color === c ? 'border-white scale-110 shadow-md ring-2 ring-purple-400' : 'border-slate-700'
                }`}
              />
            ))}
          </div>
        </div>

        {/* 16x16 Pixel Grid */}
        <div
          onMouseDown={() => setIsMouseDown(true)}
          onMouseUp={() => setIsMouseDown(false)}
          onMouseLeave={() => setIsMouseDown(false)}
          className={`grid grid-cols-16 w-64 h-64 sm:w-72 sm:h-72 border-4 border-slate-700 rounded-xl overflow-hidden shadow-2xl select-none ${
            showGrid ? 'gap-[1px] bg-slate-800' : 'gap-0 bg-transparent'
          }`}
          style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))` }}
        >
          {pixels.map((pxColor, idx) => (
            <div
              key={idx}
              onMouseDown={() => applyColor(idx)}
              onMouseEnter={() => handleMouseEnter(idx)}
              style={{ backgroundColor: pxColor }}
              className="w-full h-full cursor-pointer hover:opacity-80 transition-opacity"
            />
          ))}
        </div>

      </div>

    </div>
  );
}
