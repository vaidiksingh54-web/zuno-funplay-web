import React, { useState, useEffect } from 'react';
import { Trophy, CheckCircle2, XCircle, Timer, Sparkles, Flame, RotateCcw, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundManager } from '../../utils/soundEffects';
import { recordMissionCompletion, addXPAndCoins } from '../../utils/storage';

const QUIZ_QUESTIONS = [
  {
    category: 'Gaming Legends',
    question: "In what year was the original Super Mario Bros. released for the NES?",
    options: ["1983", "1985", "1989", "1991"],
    correct: 1,
    explanation: "Super Mario Bros. made its debut on September 13, 1985 in Japan for the Famicom, revolutionizing platformers!",
  },
  {
    category: 'Brain Teasers',
    question: "What comes next in the sequence: 2, 4, 8, 16, 32, ...?",
    options: ["48", "64", "54", "128"],
    correct: 1,
    explanation: "Each number doubles the previous number (powers of 2), so 32 × 2 = 64!",
  },
  {
    category: 'Science & Cosmos',
    question: "Which planet in our solar system has the most prominent and visible ring system?",
    options: ["Jupiter", "Saturn", "Uranus", "Neptune"],
    correct: 1,
    explanation: "Saturn's rings span thousands of kilometers and consist primarily of ice and rock particles!",
  },
  {
    category: 'Pop Culture',
    question: "What is the name of the magical board game that comes alive in the classic 1995 adventure movie?",
    options: ["Zathura", "Jumanji", "Monopoly", "Catan"],
    correct: 1,
    explanation: "Jumanji stars Robin Williams where animals and jungle perils burst into the real world with every dice roll!",
  },
  {
    category: 'AI & Tech',
    question: "What does the 'G' in GPU stand for in modern gaming hardware?",
    options: ["General", "Graphics", "Gaming", "Gigabyte"],
    correct: 1,
    explanation: "GPU stands for Graphics Processing Unit, which powers high-fps 3D rendering and neural networks!",
  },
];

export default function TriviaQuiz({ onProfileUpdate }) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15);
  const [timerActive, setTimerActive] = useState(true);

  const q = QUIZ_QUESTIONS[currentIdx];

  // Timer countdown
  useEffect(() => {
    if (!timerActive || quizCompleted || selectedAnswer !== null) return;
    if (timeLeft <= 0) {
      handleAnswerSelect(-1); // timeout
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, timerActive, quizCompleted, selectedAnswer]);

  const handleAnswerSelect = (index) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(index);
    setTimerActive(false);

    if (index === q.correct) {
      soundManager.playMatchSuccess();
      setScore(s => s + 100);
      setStreak(st => st + 1);
    } else {
      soundManager.playLoss();
      setStreak(0);
    }
  };

  const handleNext = () => {
    soundManager.playClick();
    if (currentIdx + 1 < QUIZ_QUESTIONS.length) {
      setCurrentIdx(prev => prev + 1);
      setSelectedAnswer(null);
      setTimeLeft(15);
      setTimerActive(true);
    } else {
      // Quiz finished
      setQuizCompleted(true);
      soundManager.playWin();
      confetti({ particleCount: 90, spread: 60 });
      const updated = recordMissionCompletion('quiz');
      addXPAndCoins(150, score + 200);
      if (onProfileUpdate) onProfileUpdate(updated);
    }
  };

  const restartQuiz = () => {
    soundManager.playPop();
    setCurrentIdx(0);
    setSelectedAnswer(null);
    setScore(0);
    setStreak(0);
    setQuizCompleted(false);
    setTimeLeft(15);
    setTimerActive(true);
  };

  return (
    <div className="w-full max-w-xl mx-auto bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl">
      
      {!quizCompleted ? (
        <div className="space-y-6">
          
          {/* Top Bar: Category, Streak & Timer */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-bold">
                {q.category}
              </span>
              {streak > 1 && (
                <span className="flex items-center gap-1 px-2.5 py-0.5 bg-orange-100 text-orange-700 rounded-full text-xs font-extrabold animate-pulse">
                  <Flame className="w-3.5 h-3.5 text-orange-500 fill-orange-400" />
                  {streak}x Streak!
                </span>
              )}
            </div>

            <div className="flex items-center gap-3">
              <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black ${
                timeLeft <= 5 ? 'bg-rose-100 text-rose-600 animate-ping-short' : 'bg-slate-100 text-slate-700'
              }`}>
                <Timer className="w-3.5 h-3.5" />
                <span>{timeLeft}s</span>
              </div>
              <span className="text-xs font-black text-amber-600">{score} Pts</span>
            </div>
          </div>

          {/* Progress Indicator */}
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div
              className="bg-amber-400 h-full transition-all duration-300"
              style={{ width: `${((currentIdx + 1) / QUIZ_QUESTIONS.length) * 100}%` }}
            ></div>
          </div>

          {/* Question Text */}
          <div className="py-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Question {currentIdx + 1} of {QUIZ_QUESTIONS.length}
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-1 font-heading leading-snug">
              {q.question}
            </h3>
          </div>

          {/* 4 Multi-Choice Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {q.options.map((opt, idx) => {
              const isSelected = selectedAnswer === idx;
              const isCorrect = idx === q.correct;
              const showResult = selectedAnswer !== null;

              let btnStyle = "bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200";
              if (showResult) {
                if (isCorrect) {
                  btnStyle = "bg-emerald-500 text-white border-emerald-600 shadow-md";
                } else if (isSelected) {
                  btnStyle = "bg-rose-500 text-white border-rose-600";
                } else {
                  btnStyle = "bg-slate-100 text-slate-400 border-slate-200 opacity-60";
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleAnswerSelect(idx)}
                  disabled={showResult}
                  className={`p-4 rounded-2xl border-2 text-left font-bold text-sm transition-all duration-200 flex items-center justify-between ${btnStyle}`}
                >
                  <span>{opt}</span>
                  {showResult && isCorrect && <CheckCircle2 className="w-5 h-5 text-white" />}
                  {showResult && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-white" />}
                </button>
              );
            })}
          </div>

          {/* Explanation Callout */}
          {selectedAnswer !== null && (
            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-slate-700 space-y-1">
              <span className="font-black text-amber-900">Did you know?</span>
              <p>{q.explanation}</p>
            </div>
          )}

          {/* Next Button */}
          {selectedAnswer !== null && (
            <div className="flex justify-end">
              <button
                onClick={handleNext}
                className="btn-fun flex items-center gap-2 px-6 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-full text-xs shadow-md"
              >
                <span>{currentIdx + 1 === QUIZ_QUESTIONS.length ? 'Finish Quiz' : 'Next Question'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

        </div>
      ) : (
        /* Quiz Finished Summary */
        <div className="text-center py-6 space-y-4">
          <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center text-4xl mx-auto shadow-inner">
            🏆
          </div>
          <h3 className="text-2xl font-black text-slate-900 font-heading">
            Daily Quiz Completed!
          </h3>
          <p className="text-sm text-slate-600">
            You scored <strong className="text-amber-600 font-black">{score} points</strong>!
            You earned +150 XP and unlocked the Daily Quiz Mission.
          </p>
          <div className="pt-2 flex justify-center gap-3">
            <button
              onClick={restartQuiz}
              className="btn-fun px-6 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-full text-xs shadow-md flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Play Another Quiz</span>
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
