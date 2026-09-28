import './styles/main.css';

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { CONTENT } from './config/content.js';
import { SmoothScroll } from './core/SmoothScroll.js';
import { Preloader } from './core/Preloader.js';
import { Experience } from './three/Experience.js';

import { Cursor } from './components/Cursor.js';
import { MusicPlayer } from './components/MusicPlayer.js';
import { SectionNav, findSections, progressBar } from './components/SectionNav.js';
import { celebrate } from './components/Confetti.js';

import { Hero } from './sections/Hero.js';
import { Wishes } from './sections/Wishes.js';
import { Story } from './sections/Story.js';
import { Memories } from './sections/Memories.js';
import { Celebration } from './sections/Celebration.js';
import { Letter } from './sections/Letter.js';
import { Finale } from './sections/Finale.js';

import { qs, wait } from './utils/index.js';

gsap.registerPlugin(ScrollTrigger);

if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
window.scrollTo(0, 0);

async function init() {
  document.title = `Happy Birthday, ${CONTENT.recipient}`;
  qs('[data-brand-name]').textContent = CONTENT.recipient;

  const scroll = new SmoothScroll();
  scroll.stop();

  const experience = new Experience(qs('#webgl'), { scroll });
  const music = new MusicPlayer(qs('[data-music-toggle]'), CONTENT.music);
  new Cursor();

  // Sections are created top-to-bottom so pinned sections measure correctly.
  const hero = new Hero(qs('#hero'), CONTENT);
  new Wishes(qs('#wishes'), CONTENT);
  new Story(qs('#story'), CONTENT, { scroll });
  new Memories(qs('#memories'), CONTENT, {
    onProgress: (progress) => experience.setTunnelProgress(progress),
  });

  let letter;
  const celebration = new Celebration(qs('#celebrate'), CONTENT, {
    onComplete: async () => {
      celebrate(5000);
      await wait(1800);
      scroll.scrollTo(letter.el, { duration: 2.4, offset: -40 });
      await wait(2200);
      await letter.open();
    },
  });

  letter = new Letter(qs('#letter'), CONTENT, {
    onRequestCake: () => nav.goToSection(celebration.el),
  });

  new Finale(qs('#finale'), CONTENT, {
    onReplay: () => scroll.scrollTo(0, { duration: 3.5 }),
  });

  const nav = new SectionNav({
    nav: qs('[data-section-nav]'),
    progressBar: progressBar(),
    sections: findSections(),
    scroll,
    onSceneChange: (scene) => experience.setScene(scene),
  });

  const preloader = new Preloader(qs('[data-preloader]'), {
    onOpen: () => music.play(),
  });
  await preloader.run();

  scroll.start();
  ScrollTrigger.refresh();
  hero.intro();
  document.body.classList.add('is-ready');
}

init();
