import React, { useRef, useState, useEffect } from 'react';
import { 
  Paintbrush, Pencil, Highlighter, Eraser, SprayCan, 
  RotateCcw, RotateCw, Trash2, Download, Check
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundManager } from '../../utils/soundEffects';
import { recordMissionCompletion, addXPAndCoins } from '../../utils/storage';

const PALETTE = [
  '#000000', '#ef4444', '#22c55e', '#3b82f6',
  '#f97316', '#64748b', '#eab308', '#a855f7',
  '#06b6d4', '#ffffff', '#ec4899', '#84cc16'
];

export default function DrawingStudio({ profile, onProfileUpdate }) {
  const canvasRef = useRef(null);
  const [tool, setTool] = useState('brush'); // 'brush' | 'pencil' | 'marker' | 'eraser' | 'spray'
  const [color, setColor] = useState('#22c55e');
  const [size, setSize] = useState(6);
  const [opacity, setOpacity] = useState(100);
  const [isDrawing, setIsDrawing] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyStep, setHistoryStep] = useState(-1);

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    saveState();
  }, []);

  const saveState = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL();
    setHistory(prev => [...prev.slice(0, historyStep + 1), dataUrl]);
    setHistoryStep(prev => prev + 1);
  };

  const handleUndo = () => {
    if (historyStep > 0) {
      soundManager.playClick();
      const prevStep = historyStep - 1;
      setHistoryStep(prevStep);
      restoreState(history[prevStep]);
    }
  };

  const handleRedo = () => {
    if (historyStep < history.length - 1) {
      soundManager.playClick();
      const nextStep = historyStep + 1;
      setHistoryStep(nextStep);
      restoreState(history[nextStep]);
    }
  };

  const restoreState = (dataUrl) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.src = dataUrl;
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
    };
  };

  const getCoordinates = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    if (e.touches && e.touches[0]) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY,
      };
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const startDraw = (e) => {
    soundManager.playClick();
    setIsDrawing(true);
    const { x, y } = getCoordinates(e);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(x, y);

    if (tool === 'spray') {
      sprayPaint(ctx, x, y);
    }
  };

  const sprayPaint = (ctx, x, y) => {
    const density = size * 3;
    const radius = size * 2.5;
    ctx.fillStyle = color;
    ctx.globalAlpha = opacity / 100;
    for (let i = 0; i < density; i++) {
      const offsetX = (Math.random() - 0.5) * radius * 2;
      const offsetY = (Math.random() - 0.5) * radius * 2;
      if (offsetX * offsetX + offsetY * offsetY <= radius * radius) {
        ctx.fillRect(x + offsetX, y + offsetY, 1.5, 1.5);
      }
    }
    ctx.globalAlpha = 1;
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const { x, y } = getCoordinates(e);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (tool === 'spray') {
      sprayPaint(ctx, x, y);
      return;
    }

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (tool === 'eraser') {
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = size * 2.5;
      ctx.globalAlpha = 1;
    } else if (tool === 'marker') {
      ctx.strokeStyle = color;
      ctx.lineWidth = size * 2;
      ctx.globalAlpha = 0.45;
    } else if (tool === 'pencil') {
      ctx.strokeStyle = color;
      ctx.lineWidth = Math.max(2, size * 0.7);
      ctx.globalAlpha = opacity / 100;
    } else {
      // brush
      ctx.strokeStyle = color;
      ctx.lineWidth = size;
      ctx.globalAlpha = opacity / 100;
    }

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDraw = () => {
    if (isDrawing) {
      setIsDrawing(false);
      saveState();
    }
  };

  const handleClear = () => {
    soundManager.playClick();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    saveState();
  };

  const handleDownload = () => {
    soundManager.playWin();
    confetti({ particleCount: 60, spread: 50 });
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `zuno-artwork-${Date.now()}.png`;
    link.href = canvas.toDataURL();
    link.click();

    const updated = recordMissionCompletion('creative');
    addXPAndCoins(100, 200);
    if (onProfileUpdate) onProfileUpdate(updated);
  };

  return (
    <div className="bg-gradient-to-br from-teal-50 via-slate-50 to-pink-50 p-4 sm:p-8 rounded-3xl border border-slate-200 shadow-xl">
      
      {/* Top Greeting & Controls Bar Styled after Screenshot 131400.png */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-2xl font-black text-slate-900 font-heading flex items-center gap-2">
            <span>👋 Hi, {profile.username || 'Creator'}!</span>
          </h2>
          <p className="text-xs text-slate-500 font-medium">Unleash your imagination on the ZUNO Studio canvas</p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleUndo}
            disabled={historyStep <= 0}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 disabled:opacity-40 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 shadow-xs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Undo</span>
          </button>
          <button
            onClick={handleRedo}
            disabled={historyStep >= history.length - 1}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 disabled:opacity-40 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 shadow-xs"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>Redo</span>
          </button>
          <button
            onClick={handleClear}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl border border-rose-200 shadow-xs"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>
          <button
            onClick={handleDownload}
            className="btn-fun flex items-center gap-1.5 px-4 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-black rounded-xl shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Save Art</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Toolbar Styled after Screenshot 131400.png */}
        <div className="lg:col-span-4 bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-6">
          
          {/* Tool selector */}
          <div>
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">/ TOOLS</span>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {[
                { id: 'brush', label: 'Brush', icon: Paintbrush },
                { id: 'pencil', label: 'Pencil', icon: Pencil },
                { id: 'marker', label: 'Marker', icon: Highlighter },
                { id: 'spray', label: 'Spray', icon: SprayCan },
                { id: 'eraser', label: 'Eraser', icon: Eraser },
              ].map((t) => {
                const Icon = t.icon;
                const isSelected = tool === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => {
                      soundManager.playClick();
                      setTool(t.id);
                    }}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-bold transition-all ${
                      isSelected
                        ? 'bg-amber-100/70 border-amber-400 text-amber-950 font-black shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{t.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Size Slider */}
          <div>
            <div className="flex items-center justify-between text-xs font-bold text-slate-600 mb-1">
              <span>SIZE</span>
              <span className="font-mono text-slate-900">{size}PX</span>
            </div>
            <input
              type="range"
              min="1"
              max="40"
              value={size}
              onChange={(e) => setSize(Number(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
          </div>

          {/* Opacity Slider */}
          <div>
            <div className="flex items-center justify-between text-xs font-bold text-slate-600 mb-1">
              <span>OPACITY</span>
              <span className="font-mono text-slate-900">{opacity}%</span>
            </div>
            <input
              type="range"
              min="10"
              max="100"
              value={opacity}
              onChange={(e) => setOpacity(Number(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
          </div>

          {/* Color Palette Grid */}
          <div>
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">COLORS</span>
            <div className="grid grid-cols-4 gap-2 mt-2">
              {PALETTE.map((c) => (
                <button
                  key={c}
                  onClick={() => {
                    soundManager.playClick();
                    setColor(c);
                    if (tool === 'eraser') setTool('brush');
                  }}
                  style={{ backgroundColor: c }}
                  className={`w-9 h-9 rounded-xl border-2 transition-transform transform hover:scale-110 flex items-center justify-center ${
                    color === c ? 'border-slate-900 scale-105 shadow-md' : 'border-slate-200'
                  }`}
                >
                  {color === c && (
                    <span className={`text-xs ${c === '#ffffff' || c === '#eab308' ? 'text-black' : 'text-white'}`}>
                      ✓
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Selected Color Preview + Custom Picker */}
            <div className="mt-4 flex items-center gap-3">
              <div
                style={{ backgroundColor: color }}
                className="w-full h-8 rounded-xl border border-slate-300 shadow-inner flex items-center justify-center text-[10px] font-bold text-slate-700 bg-opacity-80"
              >
                Current Color
              </div>
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-10 h-8 rounded-xl border border-slate-300 cursor-pointer p-0.5"
                title="Pick custom color"
              />
            </div>
          </div>

        </div>

        {/* Drawing Canvas Area Styled after Screenshot 131400.png */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-3 border-4 border-white shadow-xl relative aspect-[4/3] flex items-center justify-center overflow-hidden">
          <canvas
            ref={canvasRef}
            width={720}
            height={540}
            onMouseDown={startDraw}
            onMouseMove={draw}
            onMouseUp={stopDraw}
            onMouseLeave={stopDraw}
            onTouchStart={startDraw}
            onTouchMove={draw}
            onTouchEnd={stopDraw}
            className="w-full h-full block cursor-crosshair rounded-2xl bg-white touch-none"
          />
        </div>

      </div>

    </div>
  );
}
