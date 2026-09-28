import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { FlowerGarden } from '../components/FlowerGarden.js';
import { BlowDetector } from '../components/BlowDetector.js';
import { heartPuff } from '../components/Confetti.js';
import { escapeHTML, isTouchDevice, qs, qsa } from '../utils/index.js';

/** The interactive cake: blow out every candle (tap or microphone) to unlock the letter. */
export class Celebration {
  constructor(element, { celebrate }, { onComplete } = {}) {
    this.el = element;
    this.onComplete = onComplete;
    this.total = celebrate.candles;
    this.remaining = celebrate.candles;

    this.render(celebrate);
    this.garden = new FlowerGarden(qs('[data-garden]', this.el));
    this.bindEvents();
    this.setupScroll();
  }

  render(celebrate) {
    const candles = Array.from(
      { length: this.total },
      (_, i) => `
        <button class="candle" type="button" style="--i:${i}" aria-label="Blow out candle ${i + 1}" data-candle>
          <span class="candle__flame" aria-hidden="true"><span class="candle__flame-core"></span></span>
          <span class="candle__smoke" aria-hidden="true"></span>
          <span class="candle__wick" aria-hidden="true"></span>
          <span class="candle__body" aria-hidden="true"></span>
        </button>`,
    ).join('');

    this.el.innerHTML = `
      <div class="celebrate__inner container">
        <header class="section-header">
          <p class="eyebrow">${escapeHTML(celebrate.eyebrow)}</p>
          <h2 class="section-title">${escapeHTML(celebrate.title)} <em>${escapeHTML(celebrate.titleAccent)}</em></h2>
          <p class="section-lead">${escapeHTML(celebrate.lead)}</p>
        </header>

        <div class="cake-stage" data-cake-stage style="--lit:1">
          <div class="cake" data-cake>
            <div class="cake__candles">${candles}</div>
            <div class="cake__tier cake__tier--top"><span class="cake__sprinkles"></span></div>
            <div class="cake__tier cake__tier--middle"><span class="cake__sprinkles"></span></div>
            <div class="cake__tier cake__tier--bottom"><span class="cake__sprinkles"></span></div>
            <div class="cake__plate"></div>
          </div>
        </div>

        <div class="celebrate__actions">
          <p class="celebrate__status" data-status aria-live="polite"></p>
          <button class="btn btn--ghost" type="button" data-mic>
            <span aria-hidden="true">🎤</span> <span data-mic-label>Blow into your mic</span>
          </button>
        </div>
      </div>
      <div class="garden" data-garden aria-hidden="true"></div>`;

    this.stage = qs('[data-cake-stage]', this.el);
    this.cake = qs('[data-cake]', this.el);
    this.candles = qsa('[data-candle]', this.el);
    this.status = qs('[data-status]', this.el);
    this.micButton = qs('[data-mic]', this.el);
    this.micLabel = qs('[data-mic-label]', this.el);
    this.updateStatus();

    if (!BlowDetector.isSupported) this.micButton.hidden = true;
  }

  bindEvents() {
    this.candles.forEach((candle) => candle.addEventListener('click', () => this.blowOut(candle)));
    this.micButton.addEventListener('click', () => this.enableMic());

    if (!isTouchDevice()) {
      this.stage.addEventListener('pointermove', (event) => {
        const rect = this.stage.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - 0.5;
        const y = (event.clientY - rect.top) / rect.height - 0.5;
        gsap.to(this.cake, { rotateY: x * 18, rotateX: -y * 10, duration: 0.8, ease: 'power3.out' });
      });
      this.stage.addEventListener('pointerleave', () => {
        gsap.to(this.cake, { rotateY: 0, rotateX: 0, duration: 1.2, ease: 'elastic.out(1, 0.5)' });
      });
    }
  }

  setupScroll() {
    ScrollTrigger.create({
      trigger: this.el,
      start: 'top 65%',
      once: true,
      onEnter: () => this.garden.grow(),
    });

    gsap.from(this.cake, {
      scrollTrigger: { trigger: this.stage, start: 'top 85%' },
      y: 120,
      rotateX: 50,
      scale: 0.7,
      opacity: 0,
      duration: 1.6,
      ease: 'expo.out',
    });
  }

  blowOut(candle) {
    if (!candle || candle.classList.contains('is-out')) return;

    candle.classList.add('is-out');
    candle.disabled = true;
    candle.setAttribute('aria-label', 'Candle blown out');
    this.remaining -= 1;
    this.stage.style.setProperty('--lit', String(this.remaining / this.total));
    this.updateStatus();

    const rect = candle.getBoundingClientRect();
    heartPuff((rect.left + rect.width / 2) / window.innerWidth, rect.top / window.innerHeight);

    if (this.remaining === 0) this.complete();
  }

  blowNext() {
    this.blowOut(this.candles.find((candle) => !candle.classList.contains('is-out')));
  }

  updateStatus() {
    if (this.remaining === 0) {
      this.status.textContent = 'Your wish is on its way ✨';
      return;
    }
    this.status.textContent = `${this.remaining} ${this.remaining === 1 ? 'candle' : 'candles'} left - make it count`;
  }

  async enableMic() {
    if (this.detector) return;
    this.micButton.disabled = true;
    this.micLabel.textContent = 'Listening… blow gently';

    try {
      this.detector = new BlowDetector({ onBlow: () => this.blowNext() });
      await this.detector.start();
      this.micButton.classList.add('is-listening');
    } catch {
      this.detector = null;
      this.micLabel.textContent = 'Mic unavailable - tap the flames instead';
    }
  }

  complete() {
    this.detector?.stop();
    this.micButton.hidden = true;
    gsap.to(this.cake, { y: -12, duration: 0.35, yoyo: true, repeat: 3, ease: 'sine.inOut' });
    this.onComplete?.();
  }
}
