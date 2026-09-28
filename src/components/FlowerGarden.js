import { gsap } from 'gsap';
import { isSmallScreen, random } from '../utils/index.js';

const WIDTH = 1440;
const HEIGHT = 380;
const PETAL_COLORS = ['#ff5fa2', '#ff9ec4', '#f43f5e', '#e11d74', '#fda4af', '#c026d3'];
const SVG_NS = 'http://www.w3.org/2000/svg';

function flowerMarkup(index, total) {
  const x = ((index + random(0.2, 0.8)) / total) * WIDTH;
  const height = random(110, HEIGHT - 60);
  const lean = random(-60, 60);
  const topX = x + lean;
  const topY = HEIGHT - height;
  const petals = Math.round(random(5, 8));
  const radius = random(14, 26);
  const color = PETAL_COLORS[Math.floor(Math.random() * PETAL_COLORS.length)];
  const leafY = HEIGHT - height * random(0.3, 0.55);
  const leafX = x + lean * ((HEIGHT - leafY) / height);
  const leafSide = Math.random() < 0.5 ? -1 : 1;

  const petalMarkup = Array.from({ length: petals }, (_, p) => {
    const angle = (360 / petals) * p;
    return `<ellipse cx="${topX}" cy="${topY - radius * 0.6}" rx="${radius * 0.45}" ry="${radius * 0.8}"
      fill="${color}" opacity="0.92" transform="rotate(${angle} ${topX} ${topY})" />`;
  }).join('');

  return `
    <g class="flower" style="transform-origin:${x}px ${HEIGHT}px; animation-delay:${random(-6, 0).toFixed(2)}s">
      <path class="flower__stem" d="M${x} ${HEIGHT} C ${x} ${HEIGHT - height * 0.5}, ${topX - lean * 0.2} ${topY + height * 0.3}, ${topX} ${topY}"
        stroke="url(#stem-gradient)" stroke-width="${random(2.5, 4.5).toFixed(1)}" fill="none" stroke-linecap="round" />
      <path class="flower__leaf" data-origin="${leafX} ${leafY}"
        d="M${leafX} ${leafY} q ${leafSide * 26} -22 ${leafSide * 44} -6 q ${leafSide * -18} 20 ${leafSide * -44} 6 z" fill="#3f9d6b" opacity="0.9" />
      <g class="flower__head" data-origin="${topX} ${topY}">
        ${petalMarkup}
        <circle cx="${topX}" cy="${topY}" r="${radius * 0.32}" fill="#ffd6a5" />
        <circle cx="${topX}" cy="${topY}" r="${radius * 0.16}" fill="#f59e0b" opacity="0.8" />
      </g>
    </g>`;
}

/** A procedurally generated SVG garden that grows when scrolled into view. */
export class FlowerGarden {
  constructor(container) {
    this.el = container;
    const count = isSmallScreen() ? 16 : 30;

    const svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('viewBox', `0 0 ${WIDTH} ${HEIGHT}`);
    svg.setAttribute('preserveAspectRatio', 'xMidYMax slice');
    svg.setAttribute('class', 'garden__svg');
    svg.innerHTML = `
      <defs>
        <linearGradient id="stem-gradient" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stop-color="#14532d" />
          <stop offset="1" stop-color="#4ade80" />
        </linearGradient>
      </defs>
      ${Array.from({ length: count }, (_, i) => flowerMarkup(i, count)).join('')}`;
    this.el.appendChild(svg);

    this.stems = [...svg.querySelectorAll('.flower__stem')];
    this.leaves = [...svg.querySelectorAll('.flower__leaf')];
    this.heads = [...svg.querySelectorAll('.flower__head')];
    this.prepare();
  }

  prepare() {
    this.stems.forEach((stem) => {
      const length = stem.getTotalLength();
      stem.style.strokeDasharray = `${length}`;
      stem.style.strokeDashoffset = `${length}`;
    });
    this.leaves.forEach((leaf) => gsap.set(leaf, { scale: 0, svgOrigin: leaf.dataset.origin }));
    this.heads.forEach((head) => gsap.set(head, { scale: 0, rotation: -90, svgOrigin: head.dataset.origin }));
  }

  grow() {
    if (this.grown) return;
    this.grown = true;

    const tl = gsap.timeline();
    tl.to(this.stems, { strokeDashoffset: 0, duration: 2.2, ease: 'power2.out', stagger: { each: 0.05, from: 'random' } });
    tl.to(this.leaves, { scale: 1, duration: 1.2, ease: 'back.out(2)', stagger: { each: 0.04, from: 'random' } }, 0.9);
    tl.to(this.heads, { scale: 1, rotation: 0, duration: 1.6, ease: 'elastic.out(1, 0.6)', stagger: { each: 0.05, from: 'random' } }, 1.5);
    return tl;
  }
}
