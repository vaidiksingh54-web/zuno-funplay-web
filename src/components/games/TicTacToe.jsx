import React, { useState, useEffect } from 'react';
import { RotateCcw, User, Bot, Sparkles, Trophy } from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundManager } from '../../utils/soundEffects';
import { recordMissionCompletion, addXPAndCoins } from '../../utils/storage';

export default function TicTacToe({ onProfileUpdate }) {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [winner, setWinner] = useState(null);
  const [round, setRound] = useState(1);
  const [playerWins, setPlayerWins] = useState(1);
  const [botWins, setBotWins] = useState(2);
  const [vsBot, setVsBot] = useState(true);

  // Check winner
  const checkWinner = (squares) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6]
    ];
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }
    if (squares.every(s => s !== null)) {
      return 'Draw';
    }
    return null;
  };

  // Bot move logic
  useEffect(() => {
    if (vsBot && !isXNext && !winner) {
      const timer = setTimeout(() => {
        const available = board
          .map((val, idx) => (val === null ? idx : null))
          .filter(val => val !== null);

        if (available.length > 0) {
          // Simple intelligent bot: check win or block or random
          let chosen = available[Math.floor(Math.random() * available.length)];

          const newBoard = [...board];
          newBoard[chosen] = 'O';
          soundManager.playClick();
          setBoard(newBoard);

          const win = checkWinner(newBoard);
          if (win) {
            handleGameOver(win);
          } else {
            setIsXNext(true);
          }
        }
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [isXNext, vsBot, board, winner]);

  const handleCellClick = (index) => {
    if (board[index] || winner) return;
    if (vsBot && !isXNext) return;

    soundManager.playPop();
    const newBoard = [...board];
    newBoard[index] = isXNext ? 'X' : 'O';
    setBoard(newBoard);

    const win = checkWinner(newBoard);
    if (win) {
      handleGameOver(win);
    } else {
      setIsXNext(!isXNext);
    }
  };

  const handleGameOver = (winResult) => {
    setWinner(winResult);
    if (winResult === 'X') {
      soundManager.playWin();
      confetti({ particleCount: 70, spread: 60 });
      setPlayerWins(prev => prev + 1);
      const updated = recordMissionCompletion('tictactoe');
      addXPAndCoins(100, 250);
      if (onProfileUpdate) onProfileUpdate(updated);
    } else if (winResult === 'O') {
      soundManager.playLoss();
      setBotWins(prev => prev + 1);
    } else {
      soundManager.playClick();
    }
  };

  const resetGame = () => {
    soundManager.playClick();
    setBoard(Array(9).fill(null));
    setWinner(null);
    setIsXNext(true);
    setRound(prev => prev + 1);
  };

  const cellColors = [
    'bg-[#fbbf24]', 'bg-[#fb7185]', 'bg-[#fb7185]',
    'bg-[#fb7185]', 'bg-[#fbbf24]', 'bg-[#fb7185]',
    'bg-[#fb7185]', 'bg-[#fb7185]', 'bg-[#fbbf24]',
  ];

  return (
    <div className="w-full max-w-3xl mx-auto bg-[#fff0f3] rounded-3xl p-6 sm:p-10 border border-pink-200/80 shadow-md">
      
      {/* Top Header & Mode Toggle */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-slate-900 font-heading">
            TIC <span className="text-[#fb7185]">TAC</span> TOE
          </h2>
          <p className="text-xs text-slate-500 font-medium">Classic 3x3 battle inspired by ZUNO fun arcade</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setVsBot(!vsBot)}
            className="px-3 py-1.5 bg-white border border-pink-200 rounded-full text-xs font-bold text-slate-700 hover:bg-pink-50 transition-colors"
          >
            {vsBot ? "Mode: vs AI" : "Mode: 2 Player"}
          </button>
          <button
            onClick={resetGame}
            title="Restart Board"
            className="p-2 bg-white hover:bg-pink-100 border border-pink-200 text-slate-700 rounded-full transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Round Badge In Center Top — Styled exactly after Screenshot 131302.png */}
      <div className="flex justify-center mb-6">
        <div className="w-16 h-16 rounded-full bg-amber-400 border-4 border-white shadow-md flex flex-col items-center justify-center text-slate-950 font-black">
          <span className="text-sm leading-none">{round}{round === 1 ? 'st' : round === 2 ? 'nd' : round === 3 ? 'rd' : 'th'}</span>
          <span className="text-[9px] font-bold tracking-tight uppercase">Round</span>
        </div>
      </div>

      {/* Arena: Player 1 (Uwak Daniel) - Board (Center) - Player 2 (#0292) */}
      <div className="flex flex-col md:flex-row items-center justify-center gap-6 sm:gap-8">
        
        {/* Left Player Card: Uwak Daniel / You (X) */}
        <div className="flex flex-col items-center p-4 bg-white rounded-3xl border-2 border-pink-100 shadow-sm w-44">
          <div className="w-16 h-16 rounded-full bg-cyan-100 border-2 border-cyan-300 flex items-center justify-center text-3xl shadow-inner mb-2">
            👨‍🚀
          </div>
          <span className="text-sm font-black text-slate-900 font-heading">Uwak Daniel</span>
          <div className="mt-2 w-14 py-1 bg-[#fb7185] text-white text-xs font-black rounded-full flex items-center justify-center shadow-sm">
            ✕
          </div>
          <div className="mt-3 px-3 py-1 bg-amber-50 border border-amber-200 rounded-full text-[10px] font-bold text-amber-800">
            Win Rounds: {playerWins}
          </div>
        </div>

        {/* Center 3x3 Board with Dashed Outline matching Screenshot 131302.png */}
        <div className="p-3 bg-white/70 rounded-3xl border-2 border-dashed border-pink-300 shadow-sm">
          <div className="grid grid-cols-3 gap-2 w-64 h-64 sm:w-72 sm:h-72">
            {board.map((cell, idx) => (
              <button
                key={idx}
                onClick={() => handleCellClick(idx)}
                disabled={cell !== null || !!winner}
                className={`w-full h-full rounded-2xl flex items-center justify-center text-4xl sm:text-5xl font-black transition-all transform active:scale-95 shadow-sm ${
                  cellColors[idx]
                } text-white cursor-pointer hover:opacity-90`}
              >
                {cell === 'X' && (
                  <span className="text-white drop-shadow-md select-none">✕</span>
                )}
                {cell === 'O' && (
                  <span className="text-white drop-shadow-md select-none">◯</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Right Player Card: Opponent / Bot (#0292) */}
        <div className="flex flex-col items-center p-4 bg-white rounded-3xl border-2 border-pink-100 shadow-sm w-44">
          <div className="w-16 h-16 rounded-full bg-purple-100 border-2 border-purple-300 flex items-center justify-center text-3xl shadow-inner mb-2">
            👾
          </div>
          <span className="text-sm font-black text-slate-900 font-heading">#0292</span>
          <div className="mt-2 w-14 py-1 bg-[#fb7185] text-white text-xs font-black rounded-full flex items-center justify-center shadow-sm">
            ◯
          </div>
          <div className="mt-3 px-3 py-1 bg-amber-50 border border-amber-200 rounded-full text-[10px] font-bold text-amber-800">
            Win Rounds: {botWins}
          </div>
        </div>

      </div>

      {/* Bottom Status / Your Turn Pill matching 131302.png */}
      <div className="flex justify-center mt-8">
        {winner ? (
          <div className="flex flex-col items-center gap-3">
            <div className="px-8 py-3 bg-slate-900 text-white rounded-full font-black text-sm shadow-md animate-bounce">
              {winner === 'Draw' ? "It's a Draw! 🤝" : `${winner === 'X' ? 'You (✕)' : 'Opponent (◯)'} Won this round! 🎉`}
            </div>
            <button
              onClick={resetGame}
              className="btn-fun px-6 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-full text-xs shadow-sm"
            >
              Play Next Round
            </button>
          </div>
        ) : (
          <div className="px-8 py-3 bg-amber-400 text-slate-950 rounded-full font-black text-sm tracking-wide uppercase shadow-sm">
            {isXNext ? "Your Turn" : "Opponent Thinking..."}
          </div>
        )}
      </div>

    </div>
  );
}
