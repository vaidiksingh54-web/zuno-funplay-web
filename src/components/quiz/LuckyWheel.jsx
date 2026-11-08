import React, { useState, useRef } from 'react';
import { RotateCcw, Sparkles, Coins, Gift } from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundManager } from '../../utils/soundEffects';
import { recordMissionCompletion, addXPAndCoins } from '../../utils/storage';

const WHEEL_SLICES = [
  { label: '100', value: 100, color: '#8b5cf6' },
  { label: '50', value: 50, color: '#7c3aed' },
  { label: '60', value: 60, color: '#6d28d9' },
  { label: '10', value: 10, color: '#a78bfa' },
  { label: '40', value: 40, color: '#8b5cf6' },
  { label: '80', value: 80, color: '#7c3aed' },
  { label: '20', value: 20, color: '#6d28d9' },
  { label: '50', value: 50, color: '#a78bfa' },
];

export default function LuckyWheel({ onProfileUpdate }) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [wonPrize, setWonPrize] = useState(null);
  const wheelRef = useRef(null);

  const spinWheel = () => {
    if (isSpinning) return;
    soundManager.playPop();
    setIsSpinning(true);
    setWonPrize(null);

    // Pick a random slice
    const sliceCount = WHEEL_SLICES.length;
    const sliceAngle = 360 / sliceCount;
    const targetSliceIndex = Math.floor(Math.random() * sliceCount);

    // Calculate rotation: 5 full turns (1800 deg) + offset
    // Pointer is at the top (270 deg in standard circle or 0 at 12 o'clock)
    const extraTurns = 5 * 360;
    const targetDeg = extraTurns + (sliceCount - targetSliceIndex) * sliceAngle - sliceAngle / 2;

    const newRotation = rotation + targetDeg;
    setRotation(newRotation);

    // Audio ticks during spin
    let tickCount = 0;
    const tickInterval = setInterval(() => {
      soundManager.playSpinTick();
      tickCount++;
      if (tickCount > 18) clearInterval(tickInterval);
    }, 160);

    setTimeout(() => {
      clearInterval(tickInterval);
      setIsSpinning(false);
      const prize = WHEEL_SLICES[targetSliceIndex];
      setWonPrize(prize);
      soundManager.playWin();
      confetti({ particleCount: 80, spread: 60 });

      const updated = recordMissionCompletion('spin');
      addXPAndCoins(50, prize.value);
      if (onProfileUpdate) onProfileUpdate(updated);
    }, 3800);
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-3xl p-6 sm:p-8 border border-purple-100 shadow-xl text-center">
      
      <div className="mb-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-bold mb-2">
          <Sparkles className="w-3.5 h-3.5 text-purple-600" />
          <span>Daily Lucky Spin</span>
        </div>
        <h3 className="text-2xl font-black text-slate-900 font-heading">
          Spin the Wheel & Win
        </h3>
        <p className="text-xs text-slate-500 font-medium">
          Win bonus coins and complete your daily quest!
        </p>
      </div>

      {/* Wheel Container with Pointer Styled after Screenshot 134940.png */}
      <div className="relative w-64 h-64 sm:w-72 sm:h-72 mx-auto my-6 flex items-center justify-center">
        
        {/* Top Pointer Arrow */}
        <div className="absolute -top-3 z-20 w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-t-[22px] border-t-amber-400 filter drop-shadow-md"></div>

        {/* Outer Circular Ring */}
        <div
          ref={wheelRef}
          style={{
            transform: `rotate(${rotation}deg)`,
            transition: isSpinning ? 'transform 3.8s cubic-bezier(0.15, 0.9, 0.2, 1)' : 'none',
          }}
          className="w-full h-full rounded-full border-8 border-purple-300 shadow-2xl relative overflow-hidden bg-purple-900 select-none"
        >
          {/* Slices rendered using conic background & SVG labels */}
          <svg viewBox="0 0 100 100" className="w-full h-full">
            {WHEEL_SLICES.map((slice, i) => {
              const count = WHEEL_SLICES.length;
              const angle = (360 / count);
              const startA = (i * angle - 90) * (Math.PI / 180);
              const endA = ((i + 1) * angle - 90) * (Math.PI / 180);

              const x1 = 50 + 50 * Math.cos(startA);
              const y1 = 50 + 50 * Math.sin(startA);
              const x2 = 50 + 50 * Math.cos(endA);
              const y2 = 50 + 50 * Math.sin(endA);

              const pathData = `M 50 50 L ${x1} ${y1} A 50 50 0 0 1 ${x2} ${y2} Z`;

              // Text position
              const midA = ((i + 0.5) * angle - 90) * (Math.PI / 180);
              const textX = 50 + 32 * Math.cos(midA);
              const textY = 50 + 32 * Math.sin(midA);

              return (
                <g key={i}>
                  <path d={pathData} fill={slice.color} stroke="#c4b5fd" strokeWidth="0.8" />
                  <text
                    x={textX}
                    y={textY}
                    fill="white"
                    fontSize="7"
                    fontWeight="bold"
                    textAnchor="middle"
                    dominantBaseline="central"
                    transform={`rotate(${i * angle + angle / 2}, ${textX}, ${textY})`}
                  >
                    {slice.label}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Center Golden Spin Button */}
        <button
          onClick={spinWheel}
          disabled={isSpinning}
          className="absolute z-10 w-16 h-16 rounded-full bg-gradient-to-tr from-amber-500 to-amber-300 border-4 border-white shadow-lg flex items-center justify-center text-slate-950 font-black cursor-pointer hover:scale-105 active:scale-95 transition-transform"
        >
          <RotateCcw className={`w-7 h-7 text-amber-950 ${isSpinning ? 'animate-spin' : ''}`} />
        </button>

      </div>

      {/* Prize banner */}
      {wonPrize && (
        <div className="p-3 bg-amber-50 border border-amber-300 rounded-2xl flex items-center justify-center gap-2 text-sm font-black text-amber-900 animate-bounce">
          <Gift className="w-5 h-5 text-amber-600" />
          <span>You Won +{wonPrize.value} Bonus Coins!</span>
        </div>
      )}

      {/* Spin CTA */}
      <div className="mt-4">
        <button
          onClick={spinWheel}
          disabled={isSpinning}
          className="btn-fun w-full py-3 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-black rounded-2xl text-sm shadow-md"
        >
          {isSpinning ? 'Wheel is Spinning...' : 'Spin The Wheel Now!'}
        </button>
      </div>

    </div>
  );
}
