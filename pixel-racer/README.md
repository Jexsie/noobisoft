# 🏁 Pixel Racer

A retro-style pixelated car racing game built with **Next.js 15**, **React 19**, and the **Web Audio API**.

![Tech Stack](https://img.shields.io/badge/Next.js-15-black) ![React](https://img.shields.io/badge/React-19-blue) ![Style](https://img.shields.io/badge/Style-Pixel%20Art-ff69b4)

---

## 🎮 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:3000
# Press SPACEBAR to start playing!
```

---

## ✨ Features

- 🏎️ **3-lane car racing** with smooth movement and jumping
- 🚧 **3 obstacle types**: cars, barriers, and oil spills
- ⚡ **Progressive difficulty**: speed increases from 1.0x to 2.5x
- 🔊 **Retro 8-bit sound**: background music + 4 sound effects
- 🎨 **8 car colors** to choose from
- 📱 **Mobile-friendly** with touch controls
- 🏆 **Leaderboard system** (ready for Web3)
- 💥 **Particle effects** for collisions
- 📊 **Real-time scoring** with visual speed indicator

---

## 🕹️ Controls

- **SPACEBAR** → Start / Restart
- **← → or A D** → Move left/right
- **↑ or W** → Jump over obstacles
- **🔊 Button** → Sound controls (bottom-right)

---

## 📁 Project Structure

```
pixel-racer/
├── app/
│   ├── layout.js           # Root layout
│   ├── page.js             # Main page
│   └── globals.css         # All styles
├── components/
│   ├── Header.js           # Navigation
│   ├── AboutSidebar.js     # Left panel
│   ├── NFTCarSkins.js      # Right panel
│   ├── GameCanvas.js       # Game engine
│   ├── LeaderboardModal.js # Leaderboard
│   ├── SoundControls.js    # Sound UI
│   ├── ScoreDisplay.js     # Score widget
│   ├── GameOverScreen.js   # Game over
│   └── MobileControls.js   # Touch controls
├── lib/
│   ├── soundManager.js     # Sound engine
│   ├── gameConfig.js       # Configuration
│   ├── gameUtils.js        # Utilities
│   └── classes/
│       ├── PlayerCar.js    # Player logic
│       ├── Obstacle.js     # Obstacle logic
│       └── Particle.js     # Particle effects
└── Documentation (12 guides)
```

---

## 🎵 Sound System

All sounds are **generated programmatically** using the Web Audio API (no audio files needed!):

- 🎶 **Background Music**: Retro 8-bit chiptune melody
- 🔊 **Move Sounds**: Different beeps for left (400 Hz) and right (500 Hz)
- 🦘 **Jump Sound**: Rising whoosh effect (200-800 Hz)
- 💥 **Crash Sound**: White noise explosion

Click the **🔊 button** in the bottom-right corner to control sounds.

---

## 🏗️ Architecture

### Clean & Modular

- **18 JavaScript files** (no file over 350 lines!)
- **9 React components** (focused and reusable)
- **3 game classes** (OOP pattern)
- **3 utility libraries** (shared functions)

### Why This Matters

✅ **Easy to maintain** - Each file has one clear purpose
✅ **Easy to test** - Test components independently
✅ **Easy to extend** - Add features without breaking existing code
✅ **Easy to understand** - Clear structure and naming

---

## 🎯 Key Technologies

- **Next.js 15.5.4** - React framework with App Router (latest version)
- **React 19** - UI library with modern hooks and compiler (latest version)
- **Web Audio API** - Dynamic sound generation
- **Canvas API** - 2D game rendering
- **CSS3** - Pixel art styling with animations
- **localStorage** - Data persistence

---

## 🚀 Development

```bash
# Development server (with hot reload)
npm run dev

# Production build
npm run build

# Run production server
npm run start

# Check for errors
npm run lint
```

---

## 🌐 Deployment

### Deploy to Vercel (Recommended)

```bash
npm i -g vercel
vercel
```

Your game will be live in seconds!

### Other Options

- **Netlify**: Connect GitHub repo
- **Self-hosted**: Use `npm run build && npm run start`
- **Static export**: Add export script to package.json

---

## 🎨 Customization

### Change Game Speed

Edit `lib/gameConfig.js`:

```javascript
export const CONFIG = {
  obstacleSpeed: 7.5, // Increase speed
  maxSpeedMultiplier: 3.0, // Higher max difficulty
};
```

### Add Car Color

Edit `components/NFTCarSkins.js`:

```javascript
const carSkins = [
  // ... existing colors
  { color: "#00ff00", name: "Lime", label: "LIME" },
];
```

### Modify Sounds

Edit `lib/soundManager.js` to change frequencies, durations, or waveforms.

---

## 📖 Documentation

For detailed information, see:

- **INDEX.md** - Main navigation and overview
- **START.md** - Quick start guide
- **COMPONENT-ARCHITECTURE.md** - Architecture deep dive
- **SOUND-SYSTEM.md** - Sound API documentation
- **TESTING-GUIDE.md** - Testing checklist

Plus 7 more comprehensive guides!

---

## 🐛 Troubleshooting

**Game won't start?**

- Run `npm install` first
- Check `npm run dev` is running
- Check browser console (F12) for errors

**Sound not playing?**

- Press SPACEBAR first (user interaction required)
- Check browser audio settings
- Click 🔊 button to unmute

**Build errors?**

- Delete `.next` folder: `rm -rf .next`
- Reinstall: `rm -rf node_modules && npm install`

---

## 🔮 Future Features (Web3)

This game is designed for Web3 integration:

- 👛 **Wallet Connection** - Connect MetaMask to save on-chain
- 🎨 **NFT Car Skins** - Unlock exclusive designs
- 🏆 **On-Chain Leaderboard** - Permanent high scores
- 💰 **Play-to-Earn** - Earn tokens for high scores

Code placeholders and comments are ready for these features!

---

## 📝 License

Open source and free to use, modify, and distribute.

---

## 🎉 Credits

Built with ❤️ using:

- Next.js 14
- React 18
- Web Audio API
- Canvas API

Inspired by classic 90s arcade racers.

---

**Ready to race?** Run `npm run dev` and press SPACEBAR! 🏁🎮🎵
