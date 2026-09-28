uniform float uTime;
uniform float uProgress;   // 0 heart → 1 galaxy → 2 tunnel → 3 halo → 4 heart
uniform float uPixelRatio;
uniform float uSize;
uniform float uVelocity;   // smoothed scroll velocity, 0 → 1
uniform float uBeat;       // heartbeat pulse, 0 → 1
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;

attribute vec3 aGalaxy;
attribute vec3 aTunnel;
attribute vec3 aHalo;
attribute vec3 aHeartFinal;
attribute float aRandom;
attribute float aScale;

varying vec3 vColor;
varying float vAlpha;

vec3 shape(int index) {
  if (index == 0) return position;
  if (index == 1) return aGalaxy;
  if (index == 2) return aTunnel;
  if (index == 3) return aHalo;
  return aHeartFinal;
}

void main() {
  float progress = clamp(uProgress, 0.0, 4.0);
  float segment = min(floor(progress), 3.0);
  float local = progress - segment;

  // Stagger each particle so shapes dissolve organically instead of all at once.
  local = clamp((local - aRandom * 0.35) / 0.65, 0.0, 1.0);
  local = local * local * (3.0 - 2.0 * local);

  int index = int(segment);
  vec3 pos = mix(shape(index), shape(index + 1), local);

  // Mid-flight swirl: particles arc outward while travelling between shapes.
  float arc = sin(local * 3.14159265);
  vec3 swirl = vec3(sin(aRandom * 41.0), cos(aRandom * 23.0), sin(aRandom * 17.0));
  pos += swirl * arc * 1.4;

  // Living drift.
  pos.x += sin(uTime * 0.6 + aRandom * 30.0) * 0.045;
  pos.y += cos(uTime * 0.5 + aRandom * 20.0) * 0.045;
  pos.z += sin(uTime * 0.4 + aRandom * 10.0) * 0.045;

  // Heartbeat only while a heart shape is on screen.
  float heartWeight = max(1.0 - progress, 0.0) + max(progress - 3.0, 0.0);
  pos *= 1.0 + uBeat * 0.07 * heartWeight;

  // Scroll velocity scatters particles outward - the "4th dimension" is your scroll.
  pos += normalize(pos + vec3(0.0001)) * uVelocity * (0.25 + aRandom * 0.9);

  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mvPosition;
  gl_PointSize = uSize * aScale * uPixelRatio * (1.0 / max(-mvPosition.z, 0.5));
  gl_PointSize = min(gl_PointSize, 64.0 * uPixelRatio);

  vec3 color = mix(uColorA, uColorB, smoothstep(0.0, 1.0, fract(aRandom * 7.13)));
  color = mix(color, uColorC, step(0.9, aRandom));
  vColor = color;
  vAlpha = 0.6 + 0.4 * sin(uTime * 2.0 + aRandom * 60.0);
}
