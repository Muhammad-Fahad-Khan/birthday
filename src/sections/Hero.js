import { gsap } from 'gsap';
import { escapeHTML, qs, qsa, splitChars } from '../utils/index.js';

export class Hero {
  constructor(element, { recipient, hero }) {
    this.el = element;
    this.render(recipient, hero);
    this.setInitialState();
    this.setupScroll();
  }

  render(recipient, hero) {
    this.el.innerHTML = `
      <div class="hero__inner" data-hero-inner>
        <p class="eyebrow" data-hero-fade>${escapeHTML(hero.eyebrow)}</p>
        <h1 class="hero__title">
          <span class="hero__line" data-hero-split>${escapeHTML(hero.title)}</span>
          <span class="hero__name" data-hero-name>${escapeHTML(recipient)}</span>
        </h1>
        <p class="hero__quote" data-hero-fade>“${escapeHTML(hero.quote)}”</p>
        <p class="hero__prompt" data-hero-fade>${escapeHTML(hero.prompt)}</p>
      </div>
      <div class="scroll-cue" data-hero-fade aria-hidden="true">
        <span class="scroll-cue__label">Scroll</span>
        <span class="scroll-cue__line"></span>
      </div>`;

    this.inner = qs('[data-hero-inner]', this.el);
    this.chars = splitChars(qs('[data-hero-split]', this.el));
    this.name = qs('[data-hero-name]', this.el);
    this.fades = qsa('[data-hero-fade]', this.el);
  }

  setInitialState() {
    gsap.set(this.chars, { yPercent: 110, rotateX: -90, opacity: 0, transformPerspective: 600 });
    gsap.set(this.name, { clipPath: 'inset(0% 100% 0% 0%)' });
    gsap.set(this.fades, { opacity: 0, y: 24 });
  }

  /** Plays once the preloader has been dismissed. */
  intro() {
    return gsap
      .timeline({ defaults: { ease: 'expo.out' } })
      .to(this.fades[0], { opacity: 1, y: 0, duration: 1.2 })
      .to(this.chars, { yPercent: 0, rotateX: 0, opacity: 1, duration: 1.6, stagger: 0.045 }, '-=0.9')
      .to(this.name, { clipPath: 'inset(0% 0% 0% 0%)', duration: 2.2, ease: 'power2.inOut' }, '-=1.1')
      .to(this.fades.slice(1), { opacity: 1, y: 0, duration: 1.2, stagger: 0.15 }, '-=1.2');
  }

  /** The hero tilts back and dissolves into depth as you scroll away. */
  setupScroll() {
    gsap.to(this.inner, {
      scrollTrigger: { trigger: this.el, start: 'top top', end: 'bottom top', scrub: true },
      z: -400,
      rotateX: 18,
      opacity: 0,
      filter: 'blur(10px)',
      ease: 'none',
    });
  }
}
