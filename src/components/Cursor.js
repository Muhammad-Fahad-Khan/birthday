import { gsap } from 'gsap';
import { isTouchDevice, lerp, qs } from '../utils/index.js';

const INTERACTIVE = 'a, button, [data-cursor]';

/** A soft dot + trailing ring, with tiny hearts bursting on click. Desktop only. */
export class Cursor {
  constructor() {
    if (isTouchDevice()) return;

    this.dot = qs('[data-cursor-dot]');
    this.ring = qs('[data-cursor-ring]');
    this.pos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    this.ringPos = { ...this.pos };

    document.body.classList.add('has-cursor');

    window.addEventListener('pointermove', (event) => {
      this.pos.x = event.clientX;
      this.pos.y = event.clientY;
      document.body.classList.add('cursor-visible');
    });
    document.addEventListener('pointerleave', () => document.body.classList.remove('cursor-visible'));

    document.addEventListener('pointerover', (event) => {
      if (event.target.closest(INTERACTIVE)) document.body.classList.add('cursor-hover');
    });
    document.addEventListener('pointerout', (event) => {
      if (event.target.closest(INTERACTIVE)) document.body.classList.remove('cursor-hover');
    });

    window.addEventListener('pointerdown', (event) => this.burst(event.clientX, event.clientY));

    gsap.ticker.add(() => this.render());
  }

  render() {
    this.ringPos.x = lerp(this.ringPos.x, this.pos.x, 0.18);
    this.ringPos.y = lerp(this.ringPos.y, this.pos.y, 0.18);
    this.dot.style.transform = `translate3d(${this.pos.x}px, ${this.pos.y}px, 0)`;
    this.ring.style.transform = `translate3d(${this.ringPos.x}px, ${this.ringPos.y}px, 0)`;
  }

  burst(x, y) {
    for (let i = 0; i < 6; i++) {
      const heart = document.createElement('span');
      heart.className = 'cursor-heart';
      heart.textContent = '♥';
      heart.style.left = `${x}px`;
      heart.style.top = `${y}px`;
      document.body.appendChild(heart);

      const angle = (i / 6) * Math.PI * 2 + Math.random() * 0.5;
      const distance = 30 + Math.random() * 35;
      gsap.fromTo(
        heart,
        { x: 0, y: 0, scale: 0.4, opacity: 1 },
        {
          x: Math.cos(angle) * distance,
          y: Math.sin(angle) * distance - 20,
          scale: 1,
          opacity: 0,
          rotation: Math.random() * 60 - 30,
          duration: 0.9,
          ease: 'power2.out',
          onComplete: () => heart.remove(),
        },
      );
    }
  }
}
