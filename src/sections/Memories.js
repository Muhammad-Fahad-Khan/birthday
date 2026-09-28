import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { clamp, escapeHTML, isSmallScreen, mapRange, qs, qsa } from '../utils/index.js';

const SPACING = 1500; // px of depth between memories
const START_Z = -500;

/**
 * A pinned 3D "fly-through": memories hang at increasing depths and scrolling
 * moves you forward through them, while the WebGL star tunnel rushes past.
 */
export class Memories {
  constructor(element, { memories }, { onProgress } = {}) {
    this.el = element;
    this.onProgress = onProgress;
    this.render(memories);
    this.setupScroll();
  }

  render(memories) {
    const cards = memories.items
      .map((memory, i) => {
        const [from, to] = memory.colors ?? ['#ff5fa2', '#a855f7'];
        const media = memory.image
          ? `<img src="${escapeHTML(memory.image)}" alt="${escapeHTML(memory.title)}" loading="lazy" decoding="async" />`
          : `<div class="memory__art" aria-hidden="true"><span>${escapeHTML(memory.emoji ?? '💖')}</span></div>`;

        return `
          <article class="memory glass" style="--memory-from:${escapeHTML(from)};--memory-to:${escapeHTML(to)}" data-memory>
            <figure class="memory__media">${media}</figure>
            <div class="memory__body">
              <p class="memory__date"><span>${String(i + 1).padStart(2, '0')}</span>${escapeHTML(memory.date)}</p>
              <h3 class="memory__title">${escapeHTML(memory.title)}</h3>
              <p class="memory__text">${escapeHTML(memory.text)}</p>
            </div>
          </article>`;
      })
      .join('');

    this.el.innerHTML = `
      <header class="section-header container memories__header">
        <p class="eyebrow">${escapeHTML(memories.eyebrow)}</p>
        <h2 class="section-title">${escapeHTML(memories.title)} <em>${escapeHTML(memories.titleAccent)}</em></h2>
      </header>
      <div class="memories__viewport">${cards}</div>
      <div class="memories__counter" aria-hidden="true">
        <span data-memory-current>01</span>
        <span class="memories__counter-bar"><i data-memory-bar></i></span>
        <span>${String(memories.items.length).padStart(2, '0')}</span>
      </div>`;

    this.cards = qsa('[data-memory]', this.el);
    this.current = qs('[data-memory-current]', this.el);
    this.bar = qs('[data-memory-bar]', this.el);
  }

  setupScroll() {
    const travel = (this.cards.length - 1) * SPACING - START_Z;

    this.layout(0, travel);

    ScrollTrigger.create({
      trigger: this.el,
      pin: true,
      start: 'top top',
      end: () => `+=${window.innerHeight * this.cards.length * 0.9}`,
      scrub: true,
      onUpdate: (self) => {
        this.layout(self.progress, travel);
        this.onProgress?.(self.progress);
      },
      onLeave: () => this.onProgress?.(1),
      onLeaveBack: () => this.onProgress?.(0),
    });
  }

  layout(progress, travel) {
    const cameraZ = progress * travel;
    const offsetX = isSmallScreen() ? 0 : Math.min(window.innerWidth * 0.16, 240);
    let focused = 0;

    this.cards.forEach((card, i) => {
      const z = START_Z - i * SPACING + cameraZ;
      const side = i % 2 === 0 ? -1 : 1;

      // Fade in from the distance, fade out as the card passes the viewer.
      const opacity = z < -1200 ? mapRange(z, -2600, -1200, 0, 1) : mapRange(z, 150, 650, 1, 0);
      const blur = z < -1200 ? mapRange(z, -2600, -1200, 6, 0) : 0;

      card.style.transform = `translate(-50%, -50%) translate3d(${side * offsetX}px, 0, ${z}px) rotateY(${side * -10}deg)`;
      card.style.opacity = opacity.toFixed(3);
      card.style.filter = blur > 0.2 ? `blur(${blur.toFixed(1)}px)` : 'none';
      card.style.visibility = opacity < 0.01 ? 'hidden' : 'visible';

      if (z > -900) focused = i;
    });

    this.current.textContent = String(focused + 1).padStart(2, '0');
    this.bar.style.transform = `scaleX(${clamp(progress)})`;
  }
}
