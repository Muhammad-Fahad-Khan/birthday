import { gsap } from 'gsap';
import { fireworks } from '../components/Confetti.js';
import { escapeHTML, qs, splitChars } from '../utils/index.js';

export class Finale {
  constructor(element, { finale, sender }, { onReplay } = {}) {
    this.el = element;
    this.render(finale, sender);

    qs('[data-fireworks]', this.el).addEventListener('click', () => fireworks());
    qs('[data-replay]', this.el).addEventListener('click', () => onReplay?.());
    this.setupScroll();
  }

  render(finale, sender) {
    this.el.innerHTML = `
      <div class="finale__inner container">
        <p class="eyebrow">${escapeHTML(finale.eyebrow)}</p>
        <h2 class="finale__title" data-finale-title>${escapeHTML(finale.title)}</h2>
        <p class="finale__text">${escapeHTML(finale.text)}</p>
        <div class="finale__actions">
          <button class="btn btn--primary" type="button" data-fireworks>${escapeHTML(finale.fireworksLabel)} <span aria-hidden="true">🎆</span></button>
          <button class="btn btn--ghost" type="button" data-replay>${escapeHTML(finale.replayLabel)} <span aria-hidden="true">↺</span></button>
        </div>
      </div>
      <footer class="site-footer">
        Made with <span class="site-footer__heart" aria-label="love">♥</span> by ${escapeHTML(sender)} · ${new Date().getFullYear()}
      </footer>`;

    this.chars = splitChars(qs('[data-finale-title]', this.el));
  }

  setupScroll() {
    gsap.from(this.chars, {
      scrollTrigger: { trigger: this.el, start: 'top 70%' },
      yPercent: 120,
      rotateX: -90,
      transformPerspective: 600,
      opacity: 0,
      duration: 1.4,
      stagger: 0.05,
      ease: 'expo.out',
    });

    gsap.from([qs('.finale__text', this.el), qs('.finale__actions', this.el)], {
      scrollTrigger: { trigger: this.el, start: 'top 60%' },
      y: 40,
      opacity: 0,
      duration: 1.2,
      stagger: 0.15,
      delay: 0.4,
      ease: 'expo.out',
    });
  }
}
