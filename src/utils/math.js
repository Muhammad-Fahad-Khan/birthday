export const TAU = Math.PI * 2;

export const lerp = (a, b, t) => a + (b - a) * t;

export const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));

export const mapRange = (value, inMin, inMax, outMin, outMax) =>
  outMin + ((clamp(value, Math.min(inMin, inMax), Math.max(inMin, inMax)) - inMin) / (inMax - inMin)) * (outMax - outMin);

export const random = (min = 0, max = 1) => min + Math.random() * (max - min);

/** Standard normal distribution sample (Box–Muller). */
export const gaussian = () => {
  const u = 1 - Math.random();
  const v = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(TAU * v);
};

export const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
