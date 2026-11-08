import React, { useState } from 'react';
import { Sparkles, Wand2, Copy, Check, Bookmark, BookmarkCheck, Key, RefreshCw, Star, Flame } from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundManager } from '../utils/soundEffects';
import { addXPAndCoins } from '../utils/storage';

const PRESET_IDEAS = [
  {
    id: 1,
    title: "Chrono Chef: Cooking Through Time",
    category: "Video Game",
    genre: "Cozy Time-Travel Simulation",
    hook: "You run a food cart equipped with a faulty flux capacitor. Cook Roman honey cakes, Jurassic herbivore salads, and Neo-Tokyo synth-ramen before the timeline unravels!",
    mechanics: "Recipe matching, temporal ingredient freshness, paradox dodging",
    visualStyle: "Vibrant claymation 3D with neon futuristic flourishes",
    rating: "4.9",
    likes: 124,
  },
  {
    id: 2,
    title: "Shadow Puppeteer: Light & Dark Realm",
    category: "Video Game",
    genre: "Atmospheric Stealth Puzzle",
    hook: "You don't control the hero — you control the shadows cast on the wall. Stretch, rotate, and pinch shadows to create bridges, ladders, and shields for a tiny sleeping mouse.",
    mechanics: "Dynamic 2D shadow physics, lantern rotation, light-sensitive monsters",
    visualStyle: "High-contrast silhouette noir with warm candlelight gradients",
    rating: "4.8",
    likes: 98,
  },
  {
    id: 3,
    title: "Bubble Knight: Aquatic Odyssey",
    category: "Characters",
    genre: "Action Adventure",
    hook: "Sir Bubbles, a gallant sea-snail in brass armor riding a rocket-powered seahorse. Defend the Coral Kingdom against the invading Plastic Armada!",
    mechanics: "Bubble-bounce grappling hook, shell spin attack, kelp camouflage",
    visualStyle: "Playful Pixar-style subsurface scattering ocean world",
    rating: "5.0",
    likes: 142,
  },
  {
    id: 4,
    title: "Neon Pinball RPG: Quest of the Bumper",
    category: "Video Game",
    genre: "Arcade Hack-and-Slash",
    hook: "Your sword is a flipper, your hero is a pinball, and the dungeon is a 5-story mechanical pinball table packed with goblin bumpers and dragon multiball ramps!",
    mechanics: "Skill shots, tilt-saving reflexes, multiball party combat",
    visualStyle: "Synthwave cyberpunk with glowing chrome and retro score meters",
    rating: "4.7",
    likes: 87,
  },
];

const GENRES = ["Action", "Sci-Fi", "Cozy Fantasy", "Retro Arcade", "Comedy Mystery"];

export default function AIFunSection({ profile, onProfileUpdate }) {
  const [activeFilter, setActiveFilter] = useState('All');
  const [ideas, setIdeas] = useState(PRESET_IDEAS);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState('Cozy Fantasy');
  const [customPrompt, setCustomPrompt] = useState('');
  const [copiedId, setCopiedId] = useState(null);
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('zuno_gemini_key') || '');
  const [showKeyModal, setShowKeyModal] = useState(false);

  const filterTabs = ['All', 'Video Game', 'Characters', 'Story Sparks'];

  const filteredIdeas = activeFilter === 'All'
    ? ideas
    : ideas.filter(i => i.category.toLowerCase().includes(activeFilter.toLowerCase()) || i.title.toLowerCase().includes(activeFilter.toLowerCase()));

  const handleGenerateIdea = async () => {
    soundManager.playPop();
    setIsGenerating(true);

    // If user provided a Gemini key, call Gemini API
    if (apiKey.trim()) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey.trim()}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{
                parts: [{
                  text: `Generate a fun, highly creative video game or character concept in JSON format. Genre: ${selectedGenre}. Custom request: ${customPrompt || "A unique playful indie game"}. Output ONLY a JSON object with: { "title": string, "category": "Video Game" or "Characters", "genre": string, "hook": string, "mechanics": string, "visualStyle": string }`
                }]
              }],
              generationConfig: { responseMimeType: "application/json" }
            })
          }
        );

        if (response.ok) {
          const data = await response.json();
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) {
            const parsed = JSON.parse(text);
            const newIdea = {
              id: Date.now(),
              ...parsed,
              rating: "5.0",
              likes: 1,
            };
            setIdeas([newIdea, ...ideas]);
            soundManager.playWin();
            confetti({ particleCount: 50, spread: 60 });
            setIsGenerating(false);
            addXPAndCoins(60, 120);
            return;
          }
        }
      } catch (err) {
        console.warn("Gemini API call fallback to built-in generator:", err);
      }
    }

    // Built-in intelligent idea generation engine (Offline instant fallback)
    setTimeout(() => {
      const generated = generateOfflineIdea(selectedGenre, customPrompt);
      setIdeas([generated, ...ideas]);
      setIsGenerating(false);
      soundManager.playWin();
      confetti({ particleCount: 50, spread: 50 });
      const updated = addXPAndCoins(60, 120);
      if (onProfileUpdate) onProfileUpdate(updated);
    }, 700);
  };

  const generateOfflineIdea = (genre, extra) => {
    const titles = [
      "Starlight Courier: Delivery Across Galaxies",
      "Spellbound Bakery: Enchanted Pastries",
      "Mecha Gardening Club: Giant Botanists",
      "Lofi Detective: Rhythms of Noir",
      "Quantum Kittens: 9 Lives, 9 Dimensions",
      "Cloud Castle Architect: Build in the Sky",
    ];
    const hooks = [
      `In this ${genre} world, you pilot a whimsically customized vehicle delivering mysterious cosmic parcels while avoiding black hole traffic.`,
      `You brew potions into delicious treats that grant customers quirky superpowers to defeat local trickster spirits!`,
      `Giant robots equipped with watering cans and gentle shears build floating vertical terrariums across post-apocalyptic megacities.`,
      `Every clue in the rainy city produces a musical beat. Assemble clues into lo-fi chord progressions to unlock crime scenes!`,
    ];
    const mechanicsList = [
      "Gravity slingshots, package balance physics, radio station tuning",
      "Ingredient alchemy, oven heat regulation, customer satisfaction streaks",
      "Precision foliage pruning, seed cross-pollination, water cannon jetpack",
      "Rhythm matching, environmental deduction, vinyl record collection",
    ];
    const visualStyles = [
      "Ghibli-inspired pastel watercolor with relaxing ambient lighting",
      "Cozy low-poly isometric dioramas with warm candle glimmers",
      "Dreamy synthwave neon with hand-drawn cel shading",
    ];

    const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
    return {
      id: Date.now(),
      title: extra ? `${extra}: The Game` : pick(titles),
      category: Math.random() > 0.4 ? "Video Game" : "Characters",
      genre: genre,
      hook: pick(hooks),
      mechanics: pick(mechanicsList),
      visualStyle: pick(visualStyles),
      rating: "4.9",
      likes: Math.floor(Math.random() * 40 + 10),
    };
  };

  const handleCopy = (idea) => {
    soundManager.playClick();
    const text = `🎮 ${idea.title}\nGenre: ${idea.genre}\nHook: ${idea.hook}\nMechanics: ${idea.mechanics}\nVisuals: ${idea.visualStyle}`;
    navigator.clipboard.writeText(text);
    setCopiedId(idea.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-8 pb-16">
      
      {/* Header Styled after PixelPoet / Screenshot 134414.png */}
      <div className="relative rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-8 sm:p-12 border border-slate-800 shadow-xl overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-500/30 border border-purple-400/40 rounded-full text-xs font-bold text-purple-300">
            <Sparkles className="w-3.5 h-3.5" />
            <span>PixelPoet • AI Inspiration Lab</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight font-heading leading-tight">
            Make ideas <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-pink-300 to-amber-300">truly extraordinary</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 font-medium">
            Transform game concepts and creative characters into remarkable ideas with generative AI.
          </p>

          {/* Quick API Key Pill */}
          <div className="pt-2 flex items-center gap-3">
            <button
              onClick={() => setShowKeyModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 border border-slate-700 transition-colors"
            >
              <Key className="w-3.5 h-3.5 text-amber-400" />
              <span>{apiKey ? "Gemini API Connected" : "Add Gemini API Key (Optional)"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Generator Control Bar */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-md space-y-4">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          
          {/* Genre selector */}
          <div className="w-full sm:w-48 shrink-0">
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Select Genre</label>
            <select
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-purple-400"
            >
              {GENRES.map(g => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>

          {/* Custom keyword input */}
          <div className="w-full grow">
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Theme / Keyword (Optional)</label>
            <input
              type="text"
              placeholder="e.g. cyber samurai, cute hamster baker, haunted space station..."
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-purple-400"
            />
          </div>

          {/* Generate Button */}
          <div className="w-full sm:w-auto shrink-0 self-end">
            <button
              onClick={handleGenerateIdea}
              disabled={isGenerating}
              className="btn-fun w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-black rounded-xl text-xs shadow-sm"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Dreaming...</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4" />
                  <span>Generate New Idea</span>
                </>
              )}
            </button>
          </div>

        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {filterTabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveFilter(tab)}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
              activeFilter === tab
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Ideas Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredIdeas.map((idea) => (
          <div
            key={idea.id}
            className="bg-white rounded-3xl p-6 border border-slate-200 hover:border-purple-300 hover:shadow-lg transition-all flex flex-col justify-between space-y-4"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black uppercase px-2.5 py-0.5 bg-purple-100 text-purple-800 rounded-full">
                  {idea.genre}
                </span>
                <span className="flex items-center gap-1 text-xs font-bold text-amber-500">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  {idea.rating}
                </span>
              </div>

              <h3 className="text-xl font-black text-slate-900 font-heading">
                {idea.title}
              </h3>

              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                {idea.hook}
              </p>
            </div>

            <div className="space-y-2 pt-3 border-t border-slate-100 text-[11px] text-slate-500">
              <div>
                <strong className="text-slate-700">Mechanics:</strong> {idea.mechanics}
              </div>
              <div>
                <strong className="text-slate-700">Visuals:</strong> {idea.visualStyle}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-1.5 text-xs text-slate-400 font-bold">
                <Flame className="w-3.5 h-3.5 text-rose-500" />
                <span>{idea.likes} Likes</span>
              </div>

              <button
                onClick={() => handleCopy(idea)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
              >
                {copiedId === idea.id ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Concept</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal for optional Gemini API Key */}
      {showKeyModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-xl font-black text-slate-900 font-heading">Gemini API Key (Optional)</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              You can use ZUNO's built-in generative engine for free without any key. If you want direct live Gemini generation, paste your key below (stored safely in your browser only).
            </p>
            <input
              type="password"
              placeholder="AIzaSy..."
              value={apiKey}
              onChange={(e) => {
                setApiKey(e.target.value);
                localStorage.setItem('zuno_gemini_key', e.target.value);
              }}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowKeyModal(false)}
                className="btn-fun px-5 py-2 bg-slate-900 text-white rounded-full text-xs font-bold"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
