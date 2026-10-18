# 🚀 Nova the Pocket Cosmonaut | Baby's First Website
> **Track 2:**
> Built for the **haX.baby** 48-Hour Online Hackathon (17–19 October 2026)

---

## 🌌 Space Theme & Animated Background
- **Interactive Twinkling Starfield:** Multi-layered canvas starfield with depth parallax responding gently to cursor movements.
- **Shooting Stars:** Real-time meteors occasionally streaking across the deep cosmic void.
- **Cosmic Color Palette:** Deep midnight cosmos (`#080612`), radiant solar gold (`#ffc038`), cosmic nebula berry (`#ff6599`), astronaut visor cyan (`#70d6ff`), and haX.baby warm starlight cream (`#fff8f1`).
- **Lunar Station Mode:** Switchable warm day-mode theme simulating a cozy lunar greenhouse base.

---

## 👨‍🚀 Character Canon: Cadet Nova
- **Species:** Earthling Star-Toddler / Pocket Cosmonaut.
- **Craft:** Junior Stellar Cartographer & Satellite Mechanic at Orbit Station-99.
- **Appearance & Animations:**
  - **Zero-G Idle Bobbing:** Floats in a continuous 3D zero-gravity hover cycle.
  - **Curved Glass Bubble Helmet:** Dynamic glare reflection that shifts with cursor angle.
  - **360° Eye-Tracking:** Big obsidian eyes with golden starlight pupils that gaze at the visitor.
  - **Interactive Waving Hand:** Padded astronaut mitten that waves hello on mouse hover.
  - **Radio Antenna Beacon:** Pulses with warm golden telemetry light.
  - **Floating Umbilical Cable:** Ripples as the baby drifts in space.
- **Personality & Voice:** Curious, giggles at drifting space dust, speaks in sleepy ground-control transmissions.

---

## 🛠️ The 3+ Space Showcase Inventions
1. **The Stellar Navigation Loom (Tier 3 Interactive Canvas Toy):**
   - Connect telemetry lines between star relays to chart safe cosmic corridors.
   - Generates procedural pentatonic space-harp chords via the native **Web Audio API**.
   - Recognizes woven orbital patterns (*Apollo Orbital Rocket*, *Saturn's Rings*, *Sputnik Relay*, *Nova's Cosmonaut Helmet*).
2. **Nebula Capsule Laboratory:**
   - Pressurized glass specimen jars trapping fluid nebula gases (*Orion Berry*, *Solar Flare Amber*, *Andromeda Mist*, *Deep Void Violet*).
3. **Interstellar Milk-Routes (Interactive Flight Map):**
   - Interactive zero-gravity flight path connecting Earth Launch Bay, Apollo-99 Relay, Midnight Space Nursery, and Saturn Rings.
4. **Orbit Lullaby Synthesizer:**
   - Procedural music box generator playing relaxing zero-g arpeggios.

---

## 📖 Bedtime Origin Story (Scroll-Driven)
Told through 4 interactive scroll scenes (all under 50 words each):
1. *The Crib on Apollo-99*
2. *Floating Outside the Air-Lock*
3. *The Starlight Repair Station*
4. *Bedtime in Zero Gravity*

---

## 🏅 Bonus Side Quests Completed (+13 pts)
- **Live Space Radio Log (+2 pts):** Sign messages with mission stickers (🚀, 🪐, 👨‍🚀, ⭐, 🛸).
- **Sparkle Cursor Trail (+2 pts):** Physics-driven stardust trail following the pointer.
- **Space Odometer (+1 pt):** Real-time rolling ticker of logged space travelers.
- **Radio Sounds + Mute Toggle (+3 pts):** Procedural Web Audio space synthesizer with accessible mute switch.
- **Retro Space Chaos Mode (+5 pts):** Nostalgic 90s netscape marquee, space stickers, and retro badges.
- **Secret Easter Egg:** Tap the rocket brooch (`🛸`) 3 times or type **"BABY"** to unlock the *Cosmic Cosmonaut License* with confetti!

---

## 💻 Local Development
```bash
npm run server # SQLite API and static server on http://localhost:3001/
npm run dev    # Vite app on http://localhost:5173/NovaProfile/ (run in a second terminal)
npm run build  # Build the production site
npm start      # Serve the built site and shared guestbook API
```
The shared mission log uses Node's built-in SQLite support (Node 22.5 or newer) and stores data in `data/guestbook.sqlite`. Set `DATABASE_PATH` to a persistent disk location when deploying so messages survive server restarts. For a direct-source GitHub Pages frontend, set `window.NOVA_API_BASE_URL` before the module script; for a Vite build, set `VITE_API_BASE_URL`. Set `ALLOWED_ORIGIN` on the API server to the Pages origin. GitHub Pages itself cannot run the SQLite API.

Project Link : https://vedantkubal2008.github.io/NovaProfile/
