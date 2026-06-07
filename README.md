# 🐾 PixelPal

> A cute pixel-art virtual desktop companion that lives on your screen.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-blue.svg)](#installation)
[![Build](https://github.com/yourusername/pixelpal/actions/workflows/build-release.yml/badge.svg)](https://github.com/yourusername/pixelpal/actions)

---

## ⚡ One-Click Setup

> **Prerequisites:** [Node.js 18+](https://nodejs.org) — that's it.

### macOS / Linux
```bash
git clone https://github.com/MoZaidAlouli/pixee.git
cd pixelpal
chmod +x setup.sh && ./setup.sh
```

### Windows
```bat
git clone https://github.com/MoZaidAlouli/pixee.git
cd pixelpal
setup.bat
```

### Any platform (if you have Node.js)
```bash
git clone https://github.com/MoZaidAlouli/pixee.git
cd pixelpal
node setup.js
```

The setup script will:
1. ✅ Check your Node.js version
2. 📦 Install all dependencies (including Electron)
3. 🔨 Build the renderer and main process
4. 🚀 Launch PixelPal automatically

**To run again after first setup:**
```bash
npm start
```

---

## ✨ Features

### 🐱 Three Lovable Pets
- **Cat** — Independent and curious, loves to wander
- **Dog** — Energetic and loyal, tail always wagging
- **Bird** — Lively and cheerful, flutters with joy

### 🎨 Full Customization
- **6 Color Palettes** — Classic, Midnight, Forest, Sunset, Ocean, Candy
- **5 Accessories** — Top Hat, Bow, Glasses, Crown, Scarf
- **Custom Names** — Give your pet a unique identity
- **Persistent Settings** — Everything saved locally, no cloud needed

### 🎭 Rich Animation System
| State | Description |
|-------|-------------|
| Idle | Gentle breathing animation |
| Walking | Bouncy walk with tail/wing movement |
| Sleeping | Curled up with Zzz particles |
| Happy | Bouncing with hearts and sparkles |
| Jumping | Excited leaping |
| Thinking | Thoughtful dots animation |
| Curious | Looking around attentively |
| Petting | Special reaction with hearts |

### 🧠 Smart Behavior System
PixelPal uses a **Finite State Machine** to feel alive:
- Randomly wanders around your screen
- Falls asleep when you're idle for 60+ seconds
- Wakes up excited when you return
- Reacts to clicks, petting, and double-clicks
- Different moods based on your activity

### ✨ Visual Effects
- ♥ **Hearts** when petted
- ✦ **Sparkles** when happy
- z **Zzz bubbles** when sleeping
- ★ **Stars** on special interactions

### 🖥️ Desktop Integration
- Transparent, frameless window
- Always stays on top
- Fully draggable — place anywhere
- System tray icon with quick controls
- Right-click context menu
- Cross-platform (Windows, macOS, Linux)

---

## 🎮 How to Use

### Interactions
| Action | Result |
|--------|--------|
| **Click** pet | Pet becomes happy, shows hearts |
| **Triple-click** | Pet jumps with sparkles |
| **Hover** over pet | Petting reaction with hearts |
| **Drag** pet | Move it anywhere on screen |
| **Right-click** | Context menu (settings, moods, quit) |

### System Tray
- **Double-click** tray icon — toggle visibility
- **Right-click** tray icon — quick menu with all controls

### Settings
Open from right-click → Settings, or the system tray menu.
Change pet type, name, color, and accessory with live preview.

---

## 🛠️ Developer Setup (Hot-reload)

```bash
# Terminal 1 — Vite dev server
npm run dev:renderer

# Terminal 2 — TypeScript watch
npm run dev:main

# Terminal 3 — Electron
npm run dev:electron
```

### Project Structure
```
pixelpal/
├── setup.js                     ← Cross-platform one-click setup
├── setup.sh                     ← Mac/Linux one-click setup
├── setup.bat                    ← Windows one-click setup
├── src/
│   ├── main/                    ← Electron main process
│   │   ├── main.ts              ← App entry, window management
│   │   ├── preload.ts           ← Secure IPC bridge
│   │   ├── activityMonitor.ts   ← System idle detection
│   │   └── types.ts             ← Main process types
│   └── renderer/                ← React UI
│       ├── components/
│       │   ├── PetApp.tsx       ← Main pet + all interactions
│       │   ├── PetCanvas.tsx    ← Canvas animation loop
│       │   ├── ParticleSystem.tsx
│       │   ├── ContextMenu.tsx
│       │   └── SettingsApp.tsx
│       ├── store/petStore.ts    ← Zustand state
│       └── utils/
│           ├── spriteRenderer.ts ← Pixel art engine
│           └── behaviorFSM.ts   ← Behavior state machine
├── .github/workflows/
│   └── build-release.yml        ← Auto-build + release CI
└── package.json
```

---

## 📦 Build Installers

```bash
npm run dist           # Current platform
npm run dist:win       # Windows EXE
npm run dist:mac       # macOS DMG
npm run dist:linux     # Linux AppImage + DEB
```

Output goes to `release/`.

---

## 🚀 Auto-Release via GitHub Actions

```bash
git tag v1.0.0
git push origin v1.0.0
```

GitHub Actions automatically builds for all 3 platforms and publishes a GitHub Release with installers attached.

---

## 🤝 Contributing

1. Fork the repo
2. Create a feature branch
3. `node setup.js` to get started
4. Open a Pull Request

Ideas welcome: new pets, accessories, sounds, seasonal themes, multiple pets!

---

## 📄 License

MIT — see [LICENSE](LICENSE)

---

*Made with ♥ and lots of pixel art. No cloud. No telemetry. Just a tiny friend on your desktop.*
