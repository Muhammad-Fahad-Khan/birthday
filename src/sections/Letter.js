import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { escapeHTML, qs, qsa } from '../utils/index.js';

/**
 * A sealed 3D envelope. Once the candles are out, the wax seal breaks, the flap
 * swings open and the glass love letter rises out, line by line.
 */
export class Letter {
  constructor(element, { letter, recipient, sender }, { onRequestCake } = {}) {
    this.el = element;
    this.opened = false;
    this.render(letter, recipient, sender);

    qs('[data-go-cake]', this.el).addEventListener('click', () => onRequestCake?.());
    this.setupScroll();
  }

  render(letter, recipient, sender) {
    const paragraphs = letter.paragraphs.map((p) => `<p class="letter-paper__p" data-line>${escapeHTML(p)}</p>`).join('');

    this.el.innerHTML = `
      <div class="container letter__container">
        <header class="section-header">
          <p class="eyebrow">${escapeHTML(letter.eyebrow)}</p>
          <h2 class="section-title">${escapeHTML(letter.title)} <em>${escapeHTML(letter.titleAccent)}</em></h2>
        </header>

        <div class="envelope-wrap" data-envelope-wrap>
          <div class="envelope" data-envelope>
            <div class="envelope__back"></div>
            <div class="envelope__peek" data-peek></div>
            <div class="envelope__front"></div>
            <div class="envelope__flap" data-flap></div>
            <div class="envelope__seal" data-seal aria-hidden="true">♥</div>
            <p class="envelope__to">For ${escapeHTML(recipient)}</p>
          </div>
          <div class="letter__lock" data-lock>
            <p>🔒 ${escapeHTML(letter.lockedText)}</p>
            <button class="btn btn--ghost" type="button" data-go-cake>Take me to the cake</button>
          </div>
        </div>

        <article class="letter-paper glass" data-paper hidden>
          <span class="letter-paper__stamp" aria-hidden="true">♥</span>
          <p class="letter-paper__greeting" data-line>${escapeHTML(letter.greeting)}</p>
          ${paragraphs}
          <p class="letter-paper__signoff" data-line>${escapeHTML(letter.signoff)}</p>
          <p class="letter-paper__signature" data-line>${escapeHTML(sender)}</p>
        </article>
      </div>`;

    this.wrap = qs('[data-envelope-wrap]', this.el);
    this.envelope = qs('[data-envelope]', this.el);
    this.flap = qs('[data-flap]', this.el);
    this.seal = qs('[data-seal]', this.el);
    this.peek = qs('[data-peek]', this.el);
    this.lock = qs('[data-lock]', this.el);
    this.paper = qs('[data-paper]', this.el);
    this.lines = qsa('[data-line]', this.paper);
  }

  setupScroll() {
    gsap.from(this.wrap, {
      scrollTrigger: { trigger: this.wrap, start: 'top 85%' },
      y: 100,
      opacity: 0,
      duration: 1.6,
      ease: 'expo.out',
    });

    // Gentle float while waiting to be opened.
    this.float = gsap.to(this.envelope, { y: -10, rotateZ: -1.5, duration: 2.4, repeat: -1, yoyo: true, ease: 'sine.inOut' });
  }

  open() {
    if (this.opened) return Promise.resolve();
    this.opened = true;
    this.float.kill();

    return gsap
      .timeline({ defaults: { ease: 'power3.inOut' } })
      .set(this.seal, { animation: 'none' }) // let GSAP own the seal's transform
      .to(this.lock, { opacity: 0, y: 20, duration: 0.5 })
      .to(this.envelope, { y: 0, rotateZ: 0, duration: 0.4 }, '<')
      .to(this.seal, { scale: 1.4, duration: 0.25, ease: 'power2.out' })
      .to(this.seal, { scale: 0, rotation: 90, opacity: 0, duration: 0.4, ease: 'back.in(2)' })
      .to(this.flap, { rotateX: 180, duration: 1, ease: 'power2.inOut' })
      .set(this.flap, { zIndex: 0 })
      .to(this.peek, { yPercent: -70, duration: 0.9, ease: 'power2.out' }, '-=0.2')
      .to(this.envelope, { y: 60, scale: 0.85, opacity: 0, duration: 0.8, ease: 'power2.in' }, '+=0.2')
      .add(() => {
        this.paper.hidden = false;
        gsap.set(this.wrap, { overflow: 'hidden' });
        gsap.set(this.lines, { opacity: 0, y: 26, filter: 'blur(6px)' });
      })
      .to(this.wrap, { height: 0, marginBottom: 0, duration: 0.6, ease: 'power2.inOut' })
      .fromTo(
        this.paper,
        { opacity: 0, y: 120, rotateX: -25, scale: 0.92, transformPerspective: 1200 },
        { opacity: 1, y: 0, rotateX: 0, scale: 1, duration: 1.4, ease: 'expo.out' },
        '-=0.2',
      )
      .to(this.lines, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 1.1, stagger: 0.35, ease: 'power2.out' }, '-=0.8')
      .add(() => {
        this.wrap.hidden = true;
        ScrollTrigger.refresh();
      })
      .then();
  }
}
