import { gsap } from 'gsap';
import { escapeHTML, isTouchDevice, qs, qsa } from '../utils/index.js';

/**
 * A pinned, horizontally-scrolling 3D carousel. Cards swing in from the right,
 * face you at centre stage and swing away to the left - all driven by scroll.
 */
export class Wishes {
  constructor(element, { wishes }) {
    this.el = element;
    this.render(wishes);
    this.setupScroll();
    if (!isTouchDevice()) this.setupTilt();
  }

  render(wishes) {
    const cards = wishes.items
      .map(
        (wish, i) => `
          <li class="wish-card">
            <div class="wish-card__inner">
              <article class="wish-card__face" data-tilt>
                <span class="wish-card__index" aria-hidden="true">${String(i + 1).padStart(2, '0')}</span>
                <span class="wish-card__icon" aria-hidden="true">${escapeHTML(wish.icon)}</span>
                <h3 class="wish-card__title">${escapeHTML(wish.title)}</h3>
                <p class="wish-card__text">${escapeHTML(wish.text)}</p>
                <span class="wish-card__footer">wish no. ${i + 1}</span>
                <span class="wish-card__shine" aria-hidden="true"></span>
              </article>
            </div>
          </li>`,
      )
      .join('');

    this.el.innerHTML = `
      <header class="section-header container">
        <p class="eyebrow">${escapeHTML(wishes.eyebrow)}</p>
        <h2 class="section-title">${escapeHTML(wishes.title)} <em>${escapeHTML(wishes.titleAccent)}</em></h2>
        <p class="section-lead">${escapeHTML(wishes.lead)}</p>
      </header>
      <div class="wishes__viewport">
        <ol class="wishes__track" data-wishes-track>${cards}</ol>
      </div>`;

    this.track = qs('[data-wishes-track]', this.el);
    this.cards = qsa('.wish-card', this.el);
  }

  setupScroll() {
    const distance = () => Math.max(0, this.track.scrollWidth - window.innerWidth);

    const horizontal = gsap.to(this.track, {
      x: () => -distance(),
      ease: 'none',
      scrollTrigger: {
        trigger: this.el,
        pin: true,
        start: 'top top',
        end: () => `+=${distance() * 1.1}`,
        scrub: 1,
        invalidateOnRefresh: true,
      },
    });

    this.cards.forEach((card) => {
      const inner = qs('.wish-card__inner', card);
      gsap
        .timeline({
          scrollTrigger: {
            trigger: card,
            containerAnimation: horizontal,
            start: 'left right',
            end: 'right left',
            scrub: true,
          },
        })
        .fromTo(
          inner,
          { rotateY: -48, z: -260, opacity: 0.35 },
          { rotateY: 0, z: 0, opacity: 1, ease: 'power2.out' },
        )
        .to(inner, { rotateY: 48, z: -260, opacity: 0.35, ease: 'power2.in' });
    });
  }

  /** Pointer tilt with a moving highlight - lives on the face so it never fights the scroll animation. */
  setupTilt() {
    qsa('[data-tilt]', this.el).forEach((face) => {
      face.addEventListener('pointermove', (event) => {
        const rect = face.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width;
        const y = (event.clientY - rect.top) / rect.height;
        face.style.setProperty('--tilt-x', `${(0.5 - y) * 16}deg`);
        face.style.setProperty('--tilt-y', `${(x - 0.5) * 16}deg`);
        face.style.setProperty('--shine-x', `${x * 100}%`);
        face.style.setProperty('--shine-y', `${y * 100}%`);
      });
      face.addEventListener('pointerleave', () => {
        face.style.setProperty('--tilt-x', '0deg');
        face.style.setProperty('--tilt-y', '0deg');
      });
    });
  }
}
