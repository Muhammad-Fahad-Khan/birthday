import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { escapeHTML, qs, qsa } from '../utils/index.js';

const MS_PER_HOUR = 3_600_000;
const MS_PER_DAY = MS_PER_HOUR * 24;
const HEARTBEATS_PER_MINUTE = 72;

function computeStats(startDate) {
  const start = new Date(`${startDate}T00:00:00`);
  const elapsed = Math.max(0, Date.now() - (Number.isNaN(start.getTime()) ? Date.now() : start.getTime()));

  return [
    { value: Math.floor(elapsed / MS_PER_DAY), label: 'days together', icon: '📅' },
    { value: Math.floor(elapsed / MS_PER_HOUR), label: 'hours of loving you', icon: '⏳' },
    { value: Math.floor((elapsed / 60_000) * HEARTBEATS_PER_MINUTE), label: 'heartbeats, all for you', icon: '💓' },
    { value: null, label: 'reasons I adore you', icon: '♾️' },
  ];
}

/** Live relationship counters + an infinite, scroll-reactive "reasons" marquee. */
export class Story {
  constructor(element, { story, relationshipStart }, { scroll }) {
    this.el = element;
    this.scroll = scroll;
    this.render(story, computeStats(relationshipStart));
    this.setupReveal();
    this.setupMarquee();
  }

  render(story, stats) {
    const tiles = stats
      .map(
        (stat) => `
          <article class="stat glass">
            <span class="stat__icon" aria-hidden="true">${stat.icon}</span>
            <span class="stat__value" ${stat.value === null ? '' : `data-count="${stat.value}"`}>${stat.value === null ? '∞' : '0'}</span>
            <span class="stat__label">${escapeHTML(stat.label)}</span>
          </article>`,
      )
      .join('');

    const pills = story.reasons
      .map((reason) => `<span class="reason-pill">${escapeHTML(reason)}</span><span class="reason-sep" aria-hidden="true">♥</span>`)
      .join('');
    // Each row repeats its content so it can loop seamlessly.
    const row = (dir) => `
      <div class="reasons__row" data-marquee="${dir}" aria-hidden="true">
        <div class="reasons__inner">${pills}${pills}</div>
      </div>`;

    this.el.innerHTML = `
      <div class="container">
        <header class="section-header">
          <p class="eyebrow">${escapeHTML(story.eyebrow)}</p>
          <h2 class="section-title">${escapeHTML(story.title)} <em>${escapeHTML(story.titleAccent)}</em></h2>
          <p class="section-lead">${escapeHTML(story.lead)}</p>
        </header>
        <div class="stats">${tiles}</div>
      </div>
      <div class="reasons">
        <h3 class="reasons__title">${escapeHTML(story.reasonsTitle)}</h3>
        <p class="sr-only">${story.reasons.map(escapeHTML).join(', ')}</p>
        ${row(1)}
        ${row(-1)}
      </div>`;
  }

  setupReveal() {
    const tiles = qsa('.stat', this.el);

    gsap.from(tiles, {
      scrollTrigger: { trigger: qs('.stats', this.el), start: 'top 80%' },
      y: 80,
      rotateX: -35,
      transformPerspective: 900,
      opacity: 0,
      duration: 1.3,
      stagger: 0.12,
      ease: 'expo.out',
    });

    qsa('[data-count]', this.el).forEach((el) => {
      const target = Number(el.dataset.count);
      const counter = { value: 0 };
      gsap.to(counter, {
        value: target,
        duration: 2.6,
        ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 85%' },
        onUpdate: () => {
          el.textContent = Math.round(counter.value).toLocaleString();
        },
      });
    });
  }

  setupMarquee() {
    const rows = qsa('[data-marquee]', this.el).map((row) => ({
      inner: qs('.reasons__inner', row),
      direction: Number(row.dataset.marquee),
      offset: 0,
    }));

    let active = false;
    ScrollTrigger.create({
      trigger: qs('.reasons', this.el),
      start: 'top bottom',
      end: 'bottom top',
      onToggle: (self) => (active = self.isActive),
    });

    gsap.ticker.add((_, deltaMs) => {
      if (!active) return;
      const boost = 1 + Math.min(Math.abs(this.scroll.velocity) * 0.25, 12);
      rows.forEach((row) => {
        const half = row.inner.scrollWidth / 2;
        if (!half) return;
        row.offset = (row.offset + 0.04 * deltaMs * boost) % half;
        const x = row.direction > 0 ? -row.offset : row.offset - half;
        row.inner.style.transform = `translate3d(${x}px, 0, 0)`;
      });
    });
  }
}
