/**
 * Listens to the microphone and fires `onBlow` when it hears a sustained,
 * loud, breathy sound - i.e. someone blowing at their screen.
 * Requires a secure context (https:// or localhost).
 */
export class BlowDetector {
  constructor({ onBlow, threshold = 0.16, sustainFrames = 5, cooldownMs = 450 } = {}) {
    this.onBlow = onBlow;
    this.threshold = threshold;
    this.sustainFrames = sustainFrames;
    this.cooldownMs = cooldownMs;
    this.running = false;
  }

  static get isSupported() {
    return Boolean(navigator.mediaDevices?.getUserMedia) && window.isSecureContext;
  }

  async start() {
    this.stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false } });

    const AudioContext = window.AudioContext || window.webkitAudioContext;
    this.ctx = new AudioContext();
    this.analyser = this.ctx.createAnalyser();
    this.analyser.fftSize = 1024;
    this.ctx.createMediaStreamSource(this.stream).connect(this.analyser);

    this.samples = new Uint8Array(this.analyser.fftSize);
    this.loudFrames = 0;
    this.lastBlow = 0;
    this.running = true;
    this.tick();
  }

  tick = () => {
    if (!this.running) return;

    this.analyser.getByteTimeDomainData(this.samples);
    let sum = 0;
    for (const sample of this.samples) {
      const v = (sample - 128) / 128;
      sum += v * v;
    }
    const rms = Math.sqrt(sum / this.samples.length);

    this.loudFrames = rms > this.threshold ? this.loudFrames + 1 : 0;
    const now = performance.now();
    if (this.loudFrames >= this.sustainFrames && now - this.lastBlow > this.cooldownMs) {
      this.lastBlow = now;
      this.loudFrames = 0;
      this.onBlow?.();
    }

    requestAnimationFrame(this.tick);
  };

  stop() {
    this.running = false;
    this.stream?.getTracks().forEach((track) => track.stop());
    this.ctx?.close();
  }
}
