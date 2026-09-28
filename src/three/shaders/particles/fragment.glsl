varying vec3 vColor;
varying float vAlpha;

void main() {
  float dist = length(gl_PointCoord - 0.5);
  float glow = clamp(0.05 / dist - 0.1, 0.0, 1.0);
  if (glow < 0.01) discard;

  gl_FragColor = vec4(vColor, glow * vAlpha);
  #include <colorspace_fragment>
}
