# my-rhythm-game
### A Modular Multi-Sensory Rhythm Game Engine

**my-rhythm-game** is a high-performance, browser-based rhythm game platform built with **React** and **HTML5 Canvas**. Designed with a "Core Engine, Multiple Skins" philosophy, it decouples rhythm logic from visual rendering, allowing for vastly different aesthetic experiences (Rain, Cyber, Samurai, Synthwave) powered by the same underlying precision engine.

## Overview
Unlike traditional web-based games that rely on moving DOM elements, RhythmVerse uses a custom-built **Canvas Engine** to ensure 60FPS performance and a **Web Audio API** controller for zero-latency sound synthesis. 

The current version features the **Rainmaker** mode—a zen-like experience where you catch falling raindrops to generate lo-fi ambient melodies.

## Key Features
* **Modular Game Engine:** A centralized logic controller manages timing, hit-windows, and score state independent of the visual theme.
* **Zero-Latency Audio:** Programmatic sound synthesis via Web Audio API ensures audio-visual synchronization without the lag of traditional HTML5 audio tags.
* **Adaptive Theming:** Full support for System Light/Dark modes. Canvas colors and UI elements update dynamically via CSS variables.
* **Multi-Mode Lobby:** A professional navigation interface to toggle between four distinct gameplay universes.

---

## Tech Stack
* **Framework:** React 18+ (Vite)
* **Rendering:** HTML5 Canvas API
* **Audio:** Web Audio API (Oscillator-based synthesis)
* **Styling:** Tailwind CSS & CSS Variables
* **State:** React Hooks (useContext, useRef, useEffect)

---

## 📂 Project Structure
```text
/src
 ├── /components
 │    ├── Lobby.jsx          # Mode selection screen
 │    ├── GameEngine.jsx     # Canvas wrapper & Game Loop
 │    └── HUD.jsx            # Score and accuracy display
 ├── /engine
 │    ├── RainLogic.js       # Rain-specific physics & visuals
 │    └── AudioController.js # Sound synthesis logic
 ├── /data
 │    └── level1-rain.json   # Note timestamps and lane data
 └── App.jsx                 # Theme & State routing
```

---

## 🎮 Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/sneha-builds/my-rhythm-game.git
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run development server**
   ```bash
   npm run dev
   ```

---

## 🕹️ Gameplay Mechanics
Controls are mapped to a standard 4-lane setup:
* **Lane 1:** `[D]`
* **Lane 2:** `[F]`
* **Lane 3:** `[J]`
* **Lane 4:** `[K]`

**Precision Tiers:**
* **Perfect:** ±15ms
* **Good:** ±40ms
* **Miss:** >40ms or skipped note

---

## 🗺️ Roadmap
- [x] **Rainmaker Mode:** Zen/Ambient lo-fi mode.
- [ ] **Cyber Hacker:** Matrix-style falling code snippets.
- [ ] **Neon Highway:** 3D perspective synthwave driving mode.
- [ ] **Samurai Slash:** Horizontal silhouette combat rhythm.
- [ ] **Custom MIDI Support:** Allow users to upload `.mid` files to generate custom levels.

---

## 🤝 Contributing
Feel free to fork this repo and submit Pull Requests for new "Skins" or audio improvements. Let's build the ultimate web rhythm experience together!

**Maintainer:** [Sneha Builds](https://github.com/sneha-builds)  
**License:** MIT
