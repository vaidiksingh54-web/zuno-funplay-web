import React, { useState, useRef, useEffect } from 'react';
import { Pencil, Eraser, RotateCcw, Check, Users, Sparkles, Send } from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundManager } from '../../utils/soundEffects';
import { addXPAndCoins } from '../../utils/storage';

const WORDS = [
  'PIZZA', 'ROCKET', 'CAT', 'BICYCLE', 'SUNFLOWER',
  'GUITAR', 'PENGUIN', 'CASTLE', 'ROBOT', 'RAINBOW'
];

export default function DrawAndGuess({ onProfileUpdate }) {
  const canvasRef = useRef(null);
  const [wordIdx, setWordIdx] = useState(0);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#000000');
  const [tool, setTool] = useState('pencil');
  const [guessInput, setGuessInput] = useState('');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(45);
  const [isGuessed, setIsGuessed] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [mode, setMode] = useState('pass'); // 'pass' (Pass & Play) | 'solo'

  const currentWord = WORDS[wordIdx % WORDS.length];

  // Timer
  useEffect(() => {
    if (isGuessed || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          setFeedback(`Time is up! The secret word was ${currentWord}!`);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, isGuessed, currentWord]);

  // Canvas drawing
  const getPos = (e) => {
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
    setIsDrawing(true);
    const { x, y } = getPos(e);
    const ctx = canvasRef.current.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const { x, y } = getPos(e);
    const ctx = canvasRef.current.getContext('2d');
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = tool === 'eraser' ? 24 : 6;
    ctx.strokeStyle = tool === 'eraser' ? '#ffffff' : color;
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDraw = () => setIsDrawing(false);

  const clearCanvas = () => {
    soundManager.playClick();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const handleGuessSubmit = (e) => {
    e.preventDefault();
    const cleaned = guessInput.trim().toUpperCase();
    if (!cleaned) return;

    if (cleaned === currentWord) {
      soundManager.playWin();
      confetti({ particleCount: 70, spread: 60 });
      setIsGuessed(true);
      setFeedback(`🎉 Correct! It was "${currentWord}"! (+100 XP)`);
      setScore(s => s + 100);
      const updated = addXPAndCoins(100, 200);
      if (onProfileUpdate) onProfileUpdate(updated);
    } else {
      soundManager.playLoss();
      setFeedback(`"${cleaned}" is not correct. Keep guessing!`);
    }
    setGuessInput('');
  };

  const nextRound = () => {
    soundManager.playPop();
    setWordIdx(i => i + 1);
    clearCanvas();
    setTimeLeft(45);
    setIsGuessed(false);
    setFeedback('');
    setGuessInput('');
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-white text-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl space-y-4">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
        <div>
          <h2 className="text-2xl font-black font-heading text-purple-600 flex items-center gap-2">
            <span>Draw & Guess 🎨</span>
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            One player draws the secret word while friends guess it!
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3 py-1 bg-purple-50 text-purple-800 rounded-full text-xs font-black">
            Score: {score}
          </div>
          <button
            onClick={nextRound}
            className="p-2 bg-slate-100 hover:bg-slate-200 rounded-xl"
            title="Next Word"
          >
            <RotateCcw className="w-4 h-4 text-slate-700" />
          </button>
        </div>
      </div>

      {/* Secret Word Prompt Box */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-2xl border border-purple-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
        <div>
          <span className="text-[10px] font-bold text-purple-600 uppercase tracking-widest">
            SECRET WORD FOR DRAWER
          </span>
          <h3 className="text-xl font-black text-slate-900 font-heading">
            {isGuessed ? currentWord : `${currentWord} (${currentWord.length} letters)`}
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-4 py-1.5 bg-white border border-purple-200 rounded-full text-xs font-black text-purple-700">
            ⏳ {timeLeft}s remaining
          </div>
          <button
            onClick={clearCanvas}
            className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl border border-rose-200"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Drawing Canvas */}
      <div className="relative rounded-2xl overflow-hidden border-2 border-slate-200 aspect-[16/10] bg-white flex items-center justify-center shadow-inner">
        <canvas
          ref={canvasRef}
          width={560}
          height={350}
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={stopDraw}
          onMouseLeave={stopDraw}
          onTouchStart={startDraw}
          onTouchMove={draw}
          onTouchEnd={stopDraw}
          className="w-full h-full block cursor-crosshair touch-none"
        />
      </div>

      {/* Palette Tools */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => { setTool('pencil'); soundManager.playClick(); }}
            className={`p-2 rounded-xl text-xs font-bold ${tool === 'pencil' ? 'bg-purple-600 text-white' : 'bg-slate-100'}`}
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={() => { setTool('eraser'); soundManager.playClick(); }}
            className={`p-2 rounded-xl text-xs font-bold ${tool === 'eraser' ? 'bg-purple-600 text-white' : 'bg-slate-100'}`}
          >
            <Eraser className="w-4 h-4" />
          </button>
          {['#000000', '#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'].map(c => (
            <button
              key={c}
              onClick={() => { setColor(c); setTool('pencil'); soundManager.playClick(); }}
              style={{ backgroundColor: c }}
              className={`w-7 h-7 rounded-lg border-2 ${color === c && tool === 'pencil' ? 'border-slate-900 scale-110 shadow-xs' : 'border-slate-200'}`}
            />
          ))}
        </div>
      </div>

      {/* Guess Input & Submission Form */}
      <form onSubmit={handleGuessSubmit} className="flex gap-2">
        <input
          type="text"
          value={guessInput}
          onChange={(e) => setGuessInput(e.target.value)}
          placeholder="Type your guess here..."
          disabled={isGuessed}
          className="grow px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:border-purple-400"
        />
        <button
          type="submit"
          disabled={isGuessed}
          className="btn-fun px-6 py-2.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-black rounded-xl text-xs flex items-center gap-1.5"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Guess</span>
        </button>
      </form>

      {/* Feedback Alert */}
      {feedback && (
        <div className={`p-3 rounded-xl text-xs font-bold text-center ${isGuessed ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-amber-50 text-amber-800 border border-amber-200'}`}>
          {feedback}
        </div>
      )}

      {isGuessed && (
        <div className="flex justify-center">
          <button
            onClick={nextRound}
            className="btn-fun px-6 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-full text-xs shadow-md"
          >
            Next Drawing Round ➡️
          </button>
        </div>
      )}

    </div>
  );
}
