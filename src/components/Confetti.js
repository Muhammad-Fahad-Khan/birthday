import confetti from 'canvas-confetti';
import { random } from '../utils/math.js';

const COLORS = ['#ff5fa2', '#ff9ec4', '#a855f7', '#ffd6a5', '#ffffff', '#f43f5e'];
const Z_INDEX = 200;

let heartShape;
try {
  heartShape = confetti.shapeFromPath({
    path: 'M167 72c19,-38 37,-56 75,-56 42,0 76,33 76,75 0,76 -76,151 -151,227 -76,-76 -151,-151 -151,-227 0,-42 33,-75 75,-75 38,0 57,18 76,56z',
  });
} catch {
  heartShape = null;
}

const SHAPES = heartShape ? ['circle', 'square', heartShape, heartShape] : ['circle', 'square'];
const base = { colors: COLORS, shapes: SHAPES, zIndex: Z_INDEX, disableForReducedMotion: true };

/** The grand finale: a 5-second stream from both sides plus an opening burst. */
export function celebrate(duration = 5000) {
  const end = Date.now() + duration;

  confetti({ ...base, particleCount: 160, spread: 100, startVelocity: 55, origin: { x: 0.5, y: 0.65 }, scalar: 1.2 });

  (function frame() {
    confetti({ ...base, particleCount: 5, angle: 60, spread: 65, origin: { x: 0, y: 0.75 } });
    confetti({ ...base, particleCount: 5, angle: 120, spread: 65, origin: { x: 1, y: 0.75 } });
    if (Date.now() < end) requestAnimationFrame(frame);
  })();
}

/** Random firework bursts across the sky. */
export function fireworks(duration = 4000) {
  const end = Date.now() + duration;
  const timer = setInterval(() => {
    const remaining = end - Date.now();
    if (remaining <= 0) return clearInterval(timer);

    const particleCount = 50 * (remaining / duration) + 20;
    const shared = { ...base, particleCount, spread: 360, startVelocity: 30, ticks: 70, gravity: 0.9 };
    confetti({ ...shared, origin: { x: random(0.1, 0.4), y: random(0.1, 0.4) } });
    confetti({ ...shared, origin: { x: random(0.6, 0.9), y: random(0.1, 0.4) } });
  }, 260);
}

/** A small heart puff from a point on screen (0–1 coordinates). */
export function heartPuff(x, y) {
  confetti({
    ...base,
    shapes: heartShape ? [heartShape] : ['circle'],
    particleCount: 18,
    spread: 70,
    startVelocity: 22,
    gravity: 0.6,
    ticks: 90,
    scalar: 1.1,
    origin: { x, y },
  });
}
