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
  const [profile, setProfile] = useState(getProfile());
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // Synchronize state with storage
  const handleProfileUpdate = (updatedProfile) => {
    if (updatedProfile) {
      setProfile(updatedProfile);
      saveProfile(updatedProfile);
    }
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
          />
        )}

        {activeTab === 'games' && (
          <GamesSection
            profile={profile}
            onProfileUpdate={handleProfileUpdate}
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
      <footer className="bg-white border-t border-amber-100 py-10 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-400 flex items-center justify-center text-lg font-bold shadow-xs">
              🪐
            </div>
            <div>
              <span className="font-extrabold text-slate-900 font-heading text-lg">
                ZU<span className="text-amber-500">NO</span> FUNPLAY
              </span>
              <p className="text-[11px] text-slate-400">Your Universe of Fun • Games, Quizzes, AI & Creativity</p>
            </div>
          </div>

          <div className="flex items-center gap-6 text-xs font-semibold text-slate-500">
            <button onClick={() => setActiveTab('games')} className="hover:text-amber-600 transition-colors">Games</button>
            <button onClick={() => setActiveTab('quiz')} className="hover:text-amber-600 transition-colors">Quiz World</button>
            <button onClick={() => setActiveTab('ai')} className="hover:text-amber-600 transition-colors">AI Fun</button>
            <button onClick={() => setActiveTab('creative')} className="hover:text-amber-600 transition-colors">Creative Studio</button>
            <button onClick={() => setActiveTab('community')} className="hover:text-amber-600 transition-colors">Community</button>
          </div>

          <div className="text-[11px] text-slate-400 font-medium">
            © {new Date().getFullYear()} ZUNO FunPlay. Ready for everyone.
          </div>
        </div>
      </footer>

    </div>
  );
}
