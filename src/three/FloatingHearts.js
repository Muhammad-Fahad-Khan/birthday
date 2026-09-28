import * as THREE from 'three';
import { TAU, random } from '../utils/math.js';

function createHeartGeometry() {
  const shape = new THREE.Shape();
  shape.moveTo(5, 5);
  shape.bezierCurveTo(5, 5, 4, 0, 0, 0);
  shape.bezierCurveTo(-6, 0, -6, 7, -6, 7);
  shape.bezierCurveTo(-6, 11, -3, 15.4, 5, 19);
  shape.bezierCurveTo(12, 15.4, 16, 11, 16, 7);
  shape.bezierCurveTo(16, 7, 16, 0, 10, 0);
  shape.bezierCurveTo(7, 0, 5, 5, 5, 5);

  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: 4,
    bevelEnabled: true,
    bevelSegments: 4,
    bevelSize: 1.6,
    bevelThickness: 1.6,
    curveSegments: 18,
  });
  geometry.center();
  geometry.rotateZ(Math.PI); // the classic shape is drawn upside-down
  geometry.scale(0.045, 0.045, 0.045);
  return geometry;
}

const PALETTE = ['#ff5fa2', '#ff9ec4', '#c084fc', '#f43f5e', '#fda4af'];
const RANGE_Y = 15;

/**
 * Glossy 3D hearts drifting upward. Scrolling pushes them faster, with nearer
 * hearts moving more than distant ones for a layered parallax depth.
 */
export class FloatingHearts {
  constructor({ count }) {
    this.group = new THREE.Group();
    this.dummy = new THREE.Object3D();

    const material = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0x4a0628,
      emissiveIntensity: 0.55,
      roughness: 0.28,
      metalness: 0.12,
      transparent: true,
      opacity: 0.88,
    });

    this.mesh = new THREE.InstancedMesh(createHeartGeometry(), material, count);
    this.mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.mesh.frustumCulled = false;

    this.items = Array.from({ length: count }, (_, i) => {
      this.mesh.setColorAt(i, new THREE.Color(PALETTE[i % PALETTE.length]));
      return {
        x: random(-7.5, 7.5),
        y: random(-RANGE_Y / 2, RANGE_Y / 2),
        z: random(-9, 1.5),
        speed: random(0.12, 0.4),
        scale: random(0.45, 1.1),
        spin: random(0.25, 0.8) * (Math.random() < 0.5 ? -1 : 1),
        sway: random(0.3, 1.1),
        phase: random(0, TAU),
      };
    });
    this.mesh.instanceColor.needsUpdate = true;

    this.group.add(this.mesh);
  }

  update({ elapsed, scrollProgress }) {
    this.items.forEach((item, i) => {
      const depth = (item.z + 9) / 10.5; // 0 = far, 1 = near
      let y = item.y + elapsed * item.speed + scrollProgress * 22 * (0.35 + depth);
      y = (((y + RANGE_Y / 2) % RANGE_Y) + RANGE_Y) % RANGE_Y - RANGE_Y / 2;

      this.dummy.position.set(item.x + Math.sin(elapsed * item.sway + item.phase) * 0.45, y, item.z);
      this.dummy.rotation.set(
        Math.sin(elapsed * 0.5 + item.phase) * 0.35,
        item.phase + elapsed * item.spin,
        Math.sin(elapsed * 0.3 + item.phase) * 0.2,
      );
      this.dummy.scale.setScalar(item.scale);
      this.dummy.updateMatrix();
      this.mesh.setMatrixAt(i, this.dummy.matrix);
    });
    this.mesh.instanceMatrix.needsUpdate = true;
  }

  dispose() {
    this.mesh.geometry.dispose();
    this.mesh.material.dispose();
  }
}
