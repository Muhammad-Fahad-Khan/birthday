import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { prefersReducedMotion } from '../utils/device.js';

/**
 * Lenis smooth scrolling, driven by the GSAP ticker so ScrollTrigger,
 * Three.js and Lenis all update on exactly the same frame.
 */
export class SmoothScroll {
  constructor() {
    this.lenis = new Lenis({
      duration: 1.25,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: !prefersReducedMotion(),
      wheelMultiplier: 0.9,
      touchMultiplier: 1.4,
    });

    this.lenis.on('scroll', ScrollTrigger.update);

    this.raf = (time) => this.lenis.raf(time * 1000);
    gsap.ticker.add(this.raf);
    gsap.ticker.lagSmoothing(0);
  }

  /** Scroll velocity in px/frame (signed). */
  get velocity() {
    return this.lenis.velocity || 0;
  }

  /** Overall page progress, 0 → 1. */
  get progress() {
    const value = this.lenis.progress;
    return Number.isFinite(value) ? value : 0;
  }

  on(event, callback) {
    return this.lenis.on(event, callback);
  }

  scrollTo(target, options = {}) {
    this.lenis.scrollTo(target, { duration: 2, ...options });
  }

  stop() {
    this.lenis.stop();
  }

  start() {
    this.lenis.start();
  }
}
