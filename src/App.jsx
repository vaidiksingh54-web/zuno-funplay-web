import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import HomeSection from './components/HomeSection';
import GamesSection from './components/GamesSection';
import QuizWorldSection from './components/QuizWorldSection';
import AIFunSection from './components/AIFunSection';
import CreativeStudioSection from './components/CreativeStudioSection';
import CommunitySection from './components/CommunitySection';
import AuthModal from './components/AuthModal';
import { getProfile, saveProfile } from './utils/storage';
import { soundManager } from './utils/soundEffects';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [activeGame, setActiveGame] = useState('bubble');
  const [profile, setProfile] = useState(getProfile());
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // Synchronize state with storage
  const handleProfileUpdate = (updatedProfile) => {
    if (updatedProfile) {
      setProfile(updatedProfile);
      saveProfile(updatedProfile);
    }
  };

  // Direct game selector from Home or Navbar
  const handleSelectGame = (gameId) => {
    setActiveGame(gameId);
    setActiveTab('games');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Scroll to top on tab change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeTab]);

  return (
    <div className="min-h-screen flex flex-col bg-[#faf8f5] text-slate-800 font-['Plus_Jakarta_Sans',sans-serif]">
      
      {/* Top Main Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onSelectGame={handleSelectGame}
        profile={profile}
        onOpenAuth={() => {
          soundManager.playPop();
          setIsAuthOpen(true);
        }}
      />

      {/* Main Content View Switcher */}
      <main className="grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        {activeTab === 'home' && (
          <HomeSection
            setActiveTab={setActiveTab}
            profile={profile}
            onOpenAuth={() => setIsAuthOpen(true)}
            onSelectGame={handleSelectGame}
          />
        )}

        {activeTab === 'games' && (
          <GamesSection
            profile={profile}
            onProfileUpdate={handleProfileUpdate}
            activeGame={activeGame}
            setActiveGame={setActiveGame}
          />
        )}

        {activeTab === 'quiz' && (
          <QuizWorldSection
            profile={profile}
            onProfileUpdate={handleProfileUpdate}
          />
        )}

        {activeTab === 'ai' && (
          <AIFunSection
            profile={profile}
            onProfileUpdate={handleProfileUpdate}
          />
        )}

        {activeTab === 'creative' && (
          <CreativeStudioSection
            profile={profile}
            onProfileUpdate={handleProfileUpdate}
          />
        )}

        {activeTab === 'community' && (
          <CommunitySection
            profile={profile}
            onProfileUpdate={handleProfileUpdate}
            setActiveTab={setActiveTab}
          />
        )}
      </main>

      {/* Profile & Avatar Customizer Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        profile={profile}
        setProfile={setProfile}
      />

      {/* Footer Styled with ZUNO Brand */}
      <footer className="mt-16 bg-white border-t border-slate-200 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">🪐</span>
            <span className="font-extrabold text-slate-900 font-heading">ZUNO FunPlay</span>
            <span className="text-xs text-slate-400 font-medium">© 2026 Turn Boring Time Into Fun Time</span>
          </div>
          <div className="flex items-center gap-6 text-xs text-slate-500 font-semibold">
            <button onClick={() => setActiveTab('games')} className="hover:text-amber-600 transition-colors">
              12 Instant Games
            </button>
            <button onClick={() => setActiveTab('quiz')} className="hover:text-amber-600 transition-colors">
              Daily Quizzes
            </button>
            <button onClick={() => setActiveTab('ai')} className="hover:text-amber-600 transition-colors">
              AI Tools
            </button>
            <button onClick={() => setActiveTab('creative')} className="hover:text-amber-600 transition-colors">
              Creative Studio
            </button>
          </div>
        </div>
      </footer>

    </div>
  );
}
