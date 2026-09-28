import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { escapeHTML, qs, qsa } from '../utils/index.js';

/**
 * Side dot navigation + scroll progress bar + scene director.
 * One ScrollTrigger per section tells both the nav and the 3D scene what is on screen.
 */
export class SectionNav {
  constructor({ nav, progressBar, sections, scroll, onSceneChange }) {
    this.nav = nav;
    this.scroll = scroll;
    this.sections = sections;

    this.nav.innerHTML = sections
      .map(
        (section, i) => `
          <button class="section-nav__dot" type="button" data-index="${i}" aria-label="Go to ${escapeHTML(section.dataset.label)}">
            <span class="section-nav__label">${escapeHTML(section.dataset.label)}</span>
          </button>`,
      )
      .join('');
    this.dots = qsa('.section-nav__dot', this.nav);

    this.triggers = sections.map((section, i) =>
      ScrollTrigger.create({
        trigger: section,
        start: 'top 55%',
        end: 'bottom 45%',
        onToggle: (self) => {
          if (!self.isActive) return;
          this.setActive(i);
          onSceneChange?.(Number(section.dataset.scene));
        },
      }),
    );

    this.dots.forEach((dot, i) => dot.addEventListener('click', () => this.goTo(i)));
    qsa('[data-nav-link]').forEach((link) =>
      link.addEventListener('click', (event) => {
        event.preventDefault();
        this.goTo(Number(link.dataset.navLink));
      }),
    );

    scroll.on('scroll', () => {
      progressBar.style.transform = `scaleX(${scroll.progress})`;
    });
  }

  setActive(index) {
    this.dots.forEach((dot, i) => {
      dot.classList.toggle('is-active', i === index);
      if (i === index) dot.setAttribute('aria-current', 'true');
      else dot.removeAttribute('aria-current');
    });
  }

  /** Scroll using ScrollTrigger's measured start, which already accounts for pin spacing. */
  goTo(index) {
    const trigger = this.triggers[index];
    if (!trigger) return;
    const target = index === 0 ? 0 : trigger.start + window.innerHeight * 0.55;
    this.scroll.scrollTo(target, { duration: 2.2 });
  }

  goToSection(section) {
    this.goTo(this.sections.indexOf(section));
  }
}

export const findSections = () => qsa('main > section[data-scene]');
export const progressBar = () => qs('[data-scroll-progress]');
