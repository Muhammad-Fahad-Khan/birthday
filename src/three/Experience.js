import * as THREE from 'three';
import { gsap } from 'gsap';
import { ParticleMorph } from './ParticleMorph.js';
import { FloatingHearts } from './FloatingHearts.js';
import { clamp, lerp } from '../utils/math.js';
import { isSmallScreen, isTouchDevice, pixelRatio, prefersReducedMotion } from '../utils/device.js';

/**
 * The persistent WebGL "universe" behind every section.
 * Sections call `setScene(index)` and the particles morph between shapes;
 * scroll velocity, pointer position and time animate everything on top.
 */
export class Experience {
  constructor(canvas, { scroll }) {
    this.canvas = canvas;
    this.scroll = scroll;
    this.reducedMotion = prefersReducedMotion();

    this.sizes = { width: window.innerWidth, height: window.innerHeight, pixelRatio: pixelRatio() };
    this.pointer = { x: 0, y: 0, targetX: 0, targetY: 0 };
    this.state = { scene: 0, tunnel: 0, velocity: 0 };

    this.initRenderer();
    this.initScene();
    this.bindEvents();

    this.clock = new THREE.Clock();
    this.update = this.update.bind(this);
    gsap.ticker.add(this.update);
  }

  initRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.setPixelRatio(this.sizes.pixelRatio);
    this.renderer.setSize(this.sizes.width, this.sizes.height);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
  }

  initScene() {
    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(45, this.sizes.width / this.sizes.height, 0.1, 100);
    this.camera.position.set(0, 0, 9);
    this.scene.add(this.camera);

    this.scene.add(new THREE.AmbientLight(0xffffff, 0.55));
    const key = new THREE.DirectionalLight(0xffc1dc, 2.4);
    key.position.set(3, 4, 5);
    const rim = new THREE.DirectionalLight(0xa855f7, 1.6);
    rim.position.set(-4, -2, 2);
    this.scene.add(key, rim);

    const small = isSmallScreen();
    const lowPower = small || this.reducedMotion;

    this.particles = new ParticleMorph({
      count: lowPower ? 5500 : 11000,
      pixelRatio: this.sizes.pixelRatio,
      size: small ? 46 : 60,
    });
    this.hearts = new FloatingHearts({ count: lowPower ? 9 : 18 });

    this.scene.add(this.particles.points, this.hearts.group);
    this.updateLayout();
  }

  bindEvents() {
    window.addEventListener('resize', () => this.resize());

    if (!isTouchDevice()) {
      window.addEventListener('pointermove', (event) => {
        this.pointer.targetX = (event.clientX / this.sizes.width) * 2 - 1;
        this.pointer.targetY = -((event.clientY / this.sizes.height) * 2 - 1);
      });
    }
  }

  /** Morph particles to the shape for a section (0 heart, 1 galaxy, 2 tunnel, 3 halo, 4 heart). */
  setScene(index) {
    if (index === this.state.scene) return;
    this.state.scene = index;
    gsap.to(this.particles.uniforms.uProgress, {
      value: index,
      duration: this.reducedMotion ? 0.8 : 2.4,
      ease: 'power3.inOut',
      overwrite: true,
    });
  }

  /** 0 → 1 progress through the memories section; flies the camera through the star tunnel. */
  setTunnelProgress(value) {
    this.state.tunnel = value;
  }

  /** Narrow screens need the camera further back so shapes still fit. */
  updateLayout() {
    const aspect = this.sizes.width / this.sizes.height;
    this.baseZ = aspect < 0.8 ? 13 : 9;
  }

  resize() {
    this.sizes.width = window.innerWidth;
    this.sizes.height = window.innerHeight;
    this.sizes.pixelRatio = pixelRatio();

    this.camera.aspect = this.sizes.width / this.sizes.height;
    this.camera.updateProjectionMatrix();

    this.renderer.setPixelRatio(this.sizes.pixelRatio);
    this.renderer.setSize(this.sizes.width, this.sizes.height);
    this.particles.setPixelRatio(this.sizes.pixelRatio);
    this.updateLayout();
  }

  update() {
    const elapsed = this.clock.getElapsedTime();
    const motion = this.reducedMotion ? 0.3 : 1;

    // Smoothed inputs.
    const velocityTarget = clamp(Math.abs(this.scroll.velocity) * 0.012, 0, 1) * motion;
    this.state.velocity = lerp(this.state.velocity, velocityTarget, 0.08);
    this.pointer.x = lerp(this.pointer.x, this.pointer.targetX, 0.05);
    this.pointer.y = lerp(this.pointer.y, this.pointer.targetY, 0.05);

    // Double-thump heartbeat.
    const beat = Math.pow(Math.max(Math.sin(elapsed * 3.2), 0), 12) * motion;

    // Camera: gentle pointer parallax.
    this.camera.position.x = this.pointer.x * 0.7;
    this.camera.position.y = this.pointer.y * 0.45;
    this.camera.position.z = lerp(this.camera.position.z, this.baseZ, 0.05);
    this.camera.lookAt(0, 0, 0);

    // Particles: fly forward through the tunnel only while the tunnel shape is active.
    const points = this.particles.points;
    const tunnelWeight = clamp(1 - Math.abs(this.particles.progress - 2));
    points.position.z = lerp(points.position.z, this.state.tunnel * 16 * tunnelWeight, 0.08);
    points.rotation.y = Math.sin(elapsed * 0.25) * 0.35 * (1 - tunnelWeight) * motion + this.pointer.x * 0.15;
    points.rotation.x = -this.pointer.y * 0.1;

    this.particles.update({ elapsed, velocity: this.state.velocity, beat });
    this.hearts.update({ elapsed: elapsed * motion, scrollProgress: this.scroll.progress });

    this.renderer.render(this.scene, this.camera);
  }

  dispose() {
    gsap.ticker.remove(this.update);
    this.particles.dispose();
    this.hearts.dispose();
    this.renderer.dispose();
  }
}
