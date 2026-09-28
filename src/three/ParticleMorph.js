import * as THREE from 'three';
import vertexShader from './shaders/particles/vertex.glsl?raw';
import fragmentShader from './shaders/particles/fragment.glsl?raw';
import { TAU, random, gaussian } from '../utils/math.js';

/* ── Shape generators ─────────────────────────────────────── */

/** A puffy 3D heart: parametric heart curve, filled, with depth that bulges at the centre. */
function heartPoint(scale, surfaceBias) {
  const t = Math.random() * TAU;
  const x = 16 * Math.pow(Math.sin(t), 3);
  const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);

  const fill = Math.random() < surfaceBias ? random(0.9, 1) : Math.sqrt(Math.random());
  const bulge = Math.sqrt(Math.max(0, 1 - fill * fill));
  const z = (Math.random() * 2 - 1) * 6 * bulge;

  return [x * fill * scale, (y + 2.5) * fill * scale, z * scale];
}

/** A tilted four-arm spiral galaxy. */
function galaxyPoint() {
  const branches = 4;
  const radius = Math.pow(Math.random(), 1.4) * 5.8 + 0.15;
  const branchAngle = (Math.floor(Math.random() * branches) / branches) * TAU;
  const spin = radius * 0.95;
  const spread = () => Math.pow(Math.random(), 3) * (Math.random() < 0.5 ? 1 : -1) * (0.25 + radius * 0.12);

  const x = Math.cos(branchAngle + spin) * radius + spread();
  const y = spread() * 0.6;
  const z = Math.sin(branchAngle + spin) * radius + spread();

  // Tilt towards the camera.
  const tilt = 1.15;
  return [x, y * Math.cos(tilt) - z * Math.sin(tilt), y * Math.sin(tilt) + z * Math.cos(tilt)];
}

/** A long spiralling star tunnel along the Z axis - we fly through it while scrolling memories. */
function tunnelPoint() {
  const z = random(-34, 3);
  const angle = Math.random() * TAU + z * 0.18;
  const radius = random(2.4, 6.8);
  return [Math.cos(angle) * radius, Math.sin(angle) * radius, z];
}

/** A glowing halo ring around the cake, with rising embers. */
function haloPoint() {
  if (Math.random() < 0.78) {
    const angle = Math.random() * TAU;
    const radius = 3.5 + gaussian() * 0.22;
    return [Math.cos(angle) * radius, Math.sin(angle) * radius * 0.92, gaussian() * 0.25];
  }
  return [random(-6, 6), random(-4, 4.5), random(-4, 1)];
}

/* ── Particle system ──────────────────────────────────────── */

export class ParticleMorph {
  constructor({ count, pixelRatio, size }) {
    const geometry = new THREE.BufferGeometry();

    const attributes = {
      position: new Float32Array(count * 3),
      aGalaxy: new Float32Array(count * 3),
      aTunnel: new Float32Array(count * 3),
      aHalo: new Float32Array(count * 3),
      aHeartFinal: new Float32Array(count * 3),
    };
    const randoms = new Float32Array(count);
    const scales = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      attributes.position.set(heartPoint(0.11, 0.55), i3);
      attributes.aGalaxy.set(galaxyPoint(), i3);
      attributes.aTunnel.set(tunnelPoint(), i3);
      attributes.aHalo.set(haloPoint(), i3);
      attributes.aHeartFinal.set(heartPoint(0.125, 0.75), i3);
      randoms[i] = Math.random();
      scales[i] = Math.random() < 0.05 ? random(1.6, 2.4) : random(0.4, 1.3);
    }

    Object.entries(attributes).forEach(([name, array]) => {
      geometry.setAttribute(name, new THREE.BufferAttribute(array, 3));
    });
    geometry.setAttribute('aRandom', new THREE.BufferAttribute(randoms, 1));
    geometry.setAttribute('aScale', new THREE.BufferAttribute(scales, 1));

    this.uniforms = {
      uTime: { value: 0 },
      uProgress: { value: 0 },
      uPixelRatio: { value: pixelRatio },
      uSize: { value: size },
      uVelocity: { value: 0 },
      uBeat: { value: 0 },
      uColorA: { value: new THREE.Color('#ff5fa2') },
      uColorB: { value: new THREE.Color('#a855f7') },
      uColorC: { value: new THREE.Color('#ffd6a5') },
    };

    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: this.uniforms,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    this.points = new THREE.Points(geometry, material);
    // Positions are computed in the shader, so the CPU bounding sphere is meaningless.
    this.points.frustumCulled = false;
  }

  get progress() {
    return this.uniforms.uProgress.value;
  }

  setPixelRatio(value) {
    this.uniforms.uPixelRatio.value = value;
  }

  update({ elapsed, velocity, beat }) {
    this.uniforms.uTime.value = elapsed;
    this.uniforms.uVelocity.value = velocity;
    this.uniforms.uBeat.value = beat;
  }

  dispose() {
    this.points.geometry.dispose();
    this.points.material.dispose();
  }
}
