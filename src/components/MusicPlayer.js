/**
 * Background music with two sources:
 *  1. An mp3 from CONTENT.music.src (if provided), or
 *  2. A music-box "Happy Birthday" synthesised live with the Web Audio API - no asset needed.
 */

// Happy Birthday in G major, [frequency, beats] - 3/4 time.
const G4 = 392.0, A4 = 440.0, B4 = 493.88, C5 = 523.25, D5 = 587.33, E5 = 659.25, F5 = 698.46, G5 = 783.99;
const MELODY = [
  [G4, 0.75], [G4, 0.25], [A4, 1], [G4, 1], [C5, 1], [B4, 2],
  [G4, 0.75], [G4, 0.25], [A4, 1], [G4, 1], [D5, 1], [C5, 2],
  [G4, 0.75], [G4, 0.25], [G5, 1], [E5, 1], [C5, 1], [B4, 1], [A4, 2],
  [F5, 0.75], [F5, 0.25], [E5, 1], [C5, 1], [D5, 1], [C5, 3],
  [0, 3], // rest before looping
];
const BEAT = 0.62; // seconds
const LOOKAHEAD = 0.4;

class MusicBox {
  constructor(volume) {
    this.volume = volume;
    this.ctx = null;
  }

  init() {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    this.ctx = new AudioContext();

    this.master = this.ctx.createGain();
    this.master.gain.value = 0;

    // Soft echo for a dreamy music-box room.
    const delay = this.ctx.createDelay();
    delay.delayTime.value = BEAT * 0.75;
    const feedback = this.ctx.createGain();
    feedback.gain.value = 0.32;
    const tone = this.ctx.createBiquadFilter();
    tone.type = 'lowpass';
    tone.frequency.value = 2400;

    this.master.connect(tone).connect(this.ctx.destination);
    this.master.connect(delay);
    delay.connect(feedback).connect(delay);
    delay.connect(tone);

    this.noteIndex = 0;
    this.nextTime = this.ctx.currentTime + 0.1;
  }

  playNote(freq, time) {
    [1, 2, 3].forEach((harmonic, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = i === 0 ? 'sine' : 'triangle';
      osc.frequency.value = freq * harmonic;
      const peak = [0.28, 0.07, 0.025][i];
      gain.gain.setValueAtTime(0, time);
      gain.gain.linearRampToValueAtTime(peak, time + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + 1.6 / harmonic);
      osc.connect(gain).connect(this.master);
      osc.start(time);
      osc.stop(time + 1.7);
    });
  }

  /** Lookahead scheduler: freezes naturally while the context is suspended. */
  schedule = () => {
    while (this.nextTime < this.ctx.currentTime + LOOKAHEAD) {
      const [freq, beats] = MELODY[this.noteIndex];
      if (freq) this.playNote(freq, this.nextTime);
      this.nextTime += beats * BEAT;
      this.noteIndex = (this.noteIndex + 1) % MELODY.length;
    }
  };

  fadeTo(value, seconds) {
    const { gain } = this.master;
    const now = this.ctx.currentTime;
    gain.cancelScheduledValues(now);
    gain.setValueAtTime(gain.value, now);
    gain.linearRampToValueAtTime(value, now + seconds);
  }

  async play() {
    if (!this.ctx) this.init();
    await this.ctx.resume();
    this.fadeTo(this.volume, 1.2);
    clearInterval(this.timer);
    this.timer = setInterval(this.schedule, 100);
  }

  async pause() {
    if (!this.ctx) return;
    this.fadeTo(0, 0.4);
    await new Promise((resolve) => setTimeout(resolve, 420));
    clearInterval(this.timer);
    await this.ctx.suspend();
  }
}

class FileTrack {
  constructor(src, volume) {
    this.audio = new Audio(src);
    this.audio.loop = true;
    this.audio.volume = volume;
  }

  play() {
    return this.audio.play();
  }

  pause() {
    this.audio.pause();
  }
}

export class MusicPlayer {
  constructor(button, { src, volume = 0.5 } = {}) {
    this.button = button;
    this.playing = false;
    this.source = src ? new FileTrack(src, volume) : new MusicBox(volume);

    this.button?.addEventListener('click', () => this.toggle());
  }

  async play() {
    try {
      await this.source.play();
      this.setPlaying(true);
    } catch {
      // Autoplay blocked or audio unsupported - the toggle stays available.
      this.setPlaying(false);
    }
  }

  async pause() {
    await this.source.pause();
    this.setPlaying(false);
  }

  toggle() {
    return this.playing ? this.pause() : this.play();
  }

  setPlaying(value) {
    this.playing = value;
    if (!this.button) return;
    this.button.classList.toggle('is-playing', value);
    this.button.setAttribute('aria-pressed', String(value));
    this.button.setAttribute('aria-label', value ? 'Pause music' : 'Play music');
  }
}
