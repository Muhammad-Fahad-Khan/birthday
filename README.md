# 🎂 Happy Birthday - an interactive 3D love letter

A romantic, scroll-driven birthday experience. It has a WebGL particle universe that changes shape as you scroll, 3D wish cards, a fly-through memory tunnel, a cake you can blow out (by tapping or with your real breath through the microphone), and a sealed love letter that opens at the end.

## ✨ The experience

| # | Section | What happens |
|---|---------|--------------|
| 0 | **Gift opener** | A heart draws itself while assets load, then "Open your surprise". The tap also starts the music. |
| 1 | **Hero** | 11k glowing particles form a beating 3D heart. The title rises letter by letter in 3D and the name is written on in script. |
| 2 | **Wishes** | A pinned horizontal 3D carousel. Cards swing in, face you, and swing away as you scroll. They also tilt with the mouse and catch the light. |
| 3 | **Our story** | Live counters (days, hours, heartbeats) since your start date, plus two marquees of "reasons I love you" that speed up as you scroll. |
| 4 | **Memories** | A pinned 3D fly-through. Memory cards hang at different depths and you move past them while the particles become a star tunnel around you. |
| 5 | **Make a wish** | An SVG flower garden grows, and a 3D-tilting cake has flickering candles. Blow them out by tapping or with the 🎤 microphone. |
| 6 | **The letter** | Confetti, then the wax seal breaks, the envelope opens and a glass letter appears line by line. |
| 7 | **Finale** | Fireworks on demand and a "relive it" button. |

In the background, the particles change shape from **heart → galaxy → tunnel → halo → heart**, and they scatter depending on how fast you scroll. 3D hearts float past with parallax depth.

## 🚀 Getting started

Requires **Node.js 18+**.

```bash
npm install
npm run dev       # local dev server at http://localhost:5173
npm run build     # production build → dist/
npm run preview   # preview the production build
```

## 💌 Personalising it

**Everything you need to edit is in one file: [`src/config/content.js`](src/config/content.js).**

- `recipient`: their name or a pet name
- `sender`: how you sign the letter
- `relationshipStart`: your anniversary (`YYYY-MM-DD`), which drives the live counters
- `wishes.items`, `story.reasons`, `memories.items`, `letter.paragraphs`: all the words
- `celebrate.candles`: how many candles are on the cake

### Photos
Put images in `public/images/memories/` and point to them from a memory:
```js
{ date: 'Our first date', title: '…', text: '…', image: 'images/memories/first-date.jpg' }
```
Memories without an image show a gradient card with an emoji.

### Music
By default a music-box **"Happy Birthday"** is synthesised live with the Web Audio API, so no file is needed.
To use your song instead, put an mp3 in `public/audio/` and set:
```js
music: { src: 'audio/our-song.mp3', volume: 0.5 }
```

## 🗂️ Project structure

```
birthday/
├── index.html                  # Semantic shell: layers, HUD, section mount points
├── public/                     # Static files copied as-is
│   ├── favicon.svg
│   ├── audio/                  # (optional) your song
│   └── images/memories/        # (optional) your photos
├── src/
│   ├── main.js                 # App bootstrap: wires sections, scroll, 3D & audio
│   ├── config/
│   │   └── content.js          # ✏️ All personal content lives here
│   ├── core/
│   │   ├── SmoothScroll.js     # Lenis + GSAP ticker integration
│   │   └── Preloader.js        # Heart loader + "open your surprise" gate
│   ├── three/
│   │   ├── Experience.js       # Renderer, camera, lights, render loop
│   │   ├── ParticleMorph.js    # 5-shape GPU particle morph
│   │   ├── FloatingHearts.js   # Instanced 3D extruded hearts
│   │   └── shaders/particles/  # vertex.glsl / fragment.glsl
│   ├── sections/               # One module per page section
│   │   ├── Hero.js  Wishes.js  Story.js  Memories.js
│   │   └── Celebration.js  Letter.js  Finale.js
│   ├── components/             # Reusable UI / behaviour
│   │   ├── Cursor.js  SectionNav.js  MusicPlayer.js
│   │   ├── Confetti.js  FlowerGarden.js  BlowDetector.js
│   ├── utils/                  # dom / math / device helpers
│   └── styles/
│       ├── main.css            # Imports everything in order
│       ├── base/               # tokens, reset, typography, layout
│       ├── components/         # buttons, preloader, hud, cursor
│       └── sections/           # one stylesheet per section
├── vite.config.js
└── package.json
```

## 🛠️ Tech

- **Vite** for bundling and the dev server
- **Three.js** with custom GLSL shaders for the particle universe and instanced 3D hearts
- **GSAP + ScrollTrigger** for all scroll-linked and timeline animation
- **Lenis** for smooth scrolling
- **canvas-confetti**, including heart-shaped confetti
- **Web Audio API** for the synthesised music box and microphone blow detection
- Google Fonts: *Dancing Script*, *Playfair Display*, *Poppins*

## 🌍 Deploying

`npm run build` produces a static `dist/` folder. It uses relative paths, so it works on **Netlify, Vercel, GitHub Pages, Cloudflare Pages** or any static host, including sub-paths.

> 🎤 The microphone "blow out the candles" feature needs **HTTPS** (or `localhost`). All the hosts above serve HTTPS by default. If the mic isn't available, the button hides itself and tapping still works.

## ♿ Accessibility & performance

- Respects `prefers-reduced-motion`: fewer particles, calmer motion, no smooth-scroll hijack
- Uses fewer particles on mobile, caps the device pixel ratio at 2, and computes all particle motion on the GPU
- Candles are real `<button>`s, with live status announcements and keyboard focus styles
- The custom cursor only appears on devices with a precise pointer
