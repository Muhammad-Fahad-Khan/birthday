import { gsap } from 'gsap';
import { qs, wait } from '../utils/index.js';

/**
 * Draws a heart while fonts load, then waits for a tap on "Open your surprise".
 * That tap doubles as the user gesture browsers require before audio can play.
 */
export class Preloader {
  constructor(element, { onOpen } = {}) {
    this.el = element;
    this.onOpen = onOpen;
    this.count = qs('[data-preloader-count]', element);
    this.stroke = qs('.preloader__stroke', element);
    this.fill = qs('.preloader__fill', element);
    this.text = qs('[data-preloader-text]', element);
    this.button = qs('[data-preloader-btn]', element);
  }

  async run() {
    const counter = { value: 0 };
    const fontsReady = document.fonts ? document.fonts.ready : Promise.resolve();

    const progress = gsap.to(counter, {
      value: 100,
      duration: 2.4,
      ease: 'power2.inOut',
      onUpdate: () => {
        this.count.textContent = Math.round(counter.value);
        this.stroke.style.strokeDashoffset = String(1 - counter.value / 100);
      },
    });

    await Promise.all([fontsReady, wait(600), progress.then()]);
    await this.revealButton();
    await this.waitForOpen();
    await this.hide();
  }

  revealButton() {
    this.text.textContent = 'It’s ready. Take a deep breath…';
    this.button.hidden = false;

    return gsap
      .timeline()
      .to(this.fill, { opacity: 1, duration: 0.8, ease: 'power2.out' })
      .to(this.count, { opacity: 0, scale: 0.6, duration: 0.4 }, '<')
      .fromTo(this.button, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: 'expo.out' }, '-=0.4')
      .then();
  }

  waitForOpen() {
    return new Promise((resolve) => {
      this.button.focus({ preventScroll: true });
      this.button.addEventListener(
        'click',
        () => {
          this.onOpen?.();
          resolve();
        },
        { once: true },
      );
    });
  }

  hide() {
    return gsap
      .timeline({
        onComplete: () => {
          this.el.remove();
          document.body.classList.remove('is-loading');
        },
      })
      .to(this.button, { opacity: 0, y: -10, duration: 0.35 })
      .to('.preloader__heart', { scale: 14, opacity: 0, duration: 1.3, ease: 'expo.in' }, '<')
      .to(this.text, { opacity: 0, duration: 0.4 }, '<')
      .to(this.el, { opacity: 0, duration: 0.8, ease: 'power2.out' }, '-=0.35')
      .then();
  }
}
