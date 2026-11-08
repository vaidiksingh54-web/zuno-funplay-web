# 🪐 ZUNO FunPlay — Your Universe of Fun

> **"Turn Boring Time Into Fun Time"**  
> Play games, take quizzes, explore AI tools, and unleash your creativity — all in one place!

---

## 🌟 Overview

**ZUNO FunPlay** is an all-in-one interactive entertainment web application crafted strictly according to your project design mockups and instructions. It combines arcade games, brain challenges, daily trivia quizzes, AI creative prompt generation, freehand and pixel-art studios, and community quests with real-time synthesized Lo-Fi audio.

---

## 🎮 Core Sections & Functions Explained

### 1. 🏠 Home Section
* **Hero Banner**: "Turn Boring Time Into Fun Time" with vibrant branding, interactive call-to-actions, and quick navigation.
* **Quick Category Cards**: One-click access to the 5 core pillars: *Games*, *Quiz World*, *AI Fun*, *Creative Studio*, and *Community*.
* **Explore ZUNO Action Blocks**: Visual category shortcuts (*Action Games*, *Brain Games*, *Quiz Challenges*, *Creative Tools*, *Fun Activities*).
* **Daily Quest Teaser**: Instant status of daily mission rewards and player leveling.

### 2. 🕹️ Games Section
* **Tic-Tac-Toe**:
  * Classic 3x3 interactive duel designed with custom colorful rounded tiles.
  * Supports **vs AI** mode and **2-Player** local mode.
  * Tracks rounds, player wins, opponent wins, and congratulatory win confetti.
* **Match Pairs Memory Card Game**:
  * 4x4 card grid featuring 8 pairs of cute animal characters (Frog, Cat, Kangaroo, Bulldog, Fennec, Ostrich, Turtle, Bluebird).
  * Smooth card flip animations, move counter, live timer, and victory scoring.
* **Slither Snake Arena**:
  * HTML5 Canvas real-time snake gameplay.
  * Smooth steering following mouse position + click/space speed boost.
  * Glowing food pellets, friendly ambient bot snakes, and live in-game leaderboard (*Pro Cobra*, *Pro Hunter*, *Venom*).
* **Retro Arcade (Flappy Bird & Space Pong)**:
  * *Flappy Flyer*: Gravity and jump physics, pipe obstacles, collision detection, and score tracking.
  * *Space Pong*: Retro table tennis against an intelligent AI paddle with velocity increases on hit.

### 3. 🏆 Quiz World Section
* **Daily Trivia Quiz**:
  * Questions covering Gaming Legends, Brain Teasers, Science & Cosmos, Pop Culture, and Tech.
  * 15-second question countdown timer, streak multiplier, instant answer verification, and educational "Did you know?" explanations.
* **Would You Rather?**:
  * Interactive dilemma cards with live animated voting percentages and vote counters.
  * Smooth next-dilemma generator.
* **Spin The Lucky Wheel**:
  * 8-slice spinning wheel with simulated physics, Web Audio spin ticks, and instant coin reward payouts.

### 4. 🤖 AI Fun Section (PixelPoet)
* **Game & Character Concept Generator**:
  * Generates titles, genres, hooks, gameplay mechanics, and visual styles.
  * Genre presets (*Action*, *Sci-Fi*, *Cozy Fantasy*, *Retro Arcade*, *Comedy Mystery*) + custom keyword prompts.
  * Built-in instant generator engine (works 100% offline with zero setup).
  * Optional Google Gemini API key integration (saved securely in your local browser only).
  * One-click clipboard copy for game concepts.

### 5. 🎨 Creative Studio Section
* **Drawing Canvas**:
  * Tools: *Brush*, *Pencil*, *Marker*, *Spray Can*, and *Eraser*.
  * Stroke size slider (1px to 40px) and opacity slider (10% to 100%).
  * 12-color preset palette + custom HTML5 color picker.
  * Undo / Redo history stack, Clear canvas, and PNG artwork export.
* **Pixel Art Studio**:
  * 16x16 retro sprite editor.
  * Pencil, paint bucket fill, eraser, color swatches, grid toggle, and PNG sprite export.

### 6. 👥 Community Section
* **Daily Missions**:
  * 5 active quests linked to in-app gameplay (Duel in Tic-Tac-Toe, Score 50 in Snake, Complete Trivia, Draw a Masterpiece, Spin Lucky Wheel).
  * Rewards tracking and 1,000 coin claims.
* **Global Leaderboard & Badges**:
  * Player rankings table displaying Levels, XP, Titles, and Tier Badges.
  * Achievement badge showcase (*Headshot Champion*, *Loot Hunter*, *Master of Fun*, *Daily Warrior*).
* **Clayplay Lo-Fi Audio Lounge**:
  * Web Audio API synthesized ambient chill chords (*Sunrise Mix*, *Deep Focus*, *Acoustic Chill*, *Wave Lounge*, *Mountain Calm*).
  * Play, pause, skip, shuffle, and volume controls with zero external audio assets required.

---

## 🛠️ Technology Stack

* **Framework**: React 19 + Vite 6
* **Styling**: Tailwind CSS v4 + Plus Jakarta Sans & Fredoka typography
* **Icons**: Lucide React
* **Visual Effects**: Canvas Confetti
* **Audio Engine**: Native Web Audio API Synthesizer (Latency-free, zero broken audio links)
* **Storage**: LocalStorage API for offline persistence of XP, coins, scores, and missions

---

## 🚀 Getting Started

### Prerequisites
* Node.js (v18 or higher recommended)
* npm (v9 or higher)

### Installation & Run

1. Clone or navigate to the project directory:
   ```bash
   cd "zeno funplay-web"
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Launch development server:
   ```bash
   npm run dev
   ```
   Open your browser at the displayed local URL (typically `http://localhost:5173`).

4. Build for production:
   ```bash
   npm run build
   ```

---

## 🔒 Environment & Security Policy

* **No `.env` or secret files are pushed to GitHub**: Strict `.gitignore` rules prevent any credential or environment leakage.
* Any optional API key entered by the user in the UI is stored strictly inside client-side `localStorage` and never transmitted to external servers.

---

## 💡 Note on Project Scope

Per instructions, only the sections and features shown in the approved design mockups and instructions have been created:
1. `Home`
2. `Games`
3. `Quiz World`
4. `AI Fun`
5. `Creative Studio`
6. `Community`

*If you would like to add any further features, new games, or additional sections in the future, please let us know and we will be delighted to implement them for you!*
