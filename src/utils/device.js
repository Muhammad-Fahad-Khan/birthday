const matches = (query) => typeof window !== 'undefined' && window.matchMedia(query).matches;

export const prefersReducedMotion = () => matches('(prefers-reduced-motion: reduce)');

export const isTouchDevice = () => matches('(hover: none), (pointer: coarse)');

export const isSmallScreen = () => window.innerWidth < 768;

export const pixelRatio = () => Math.min(window.devicePixelRatio || 1, 2);
