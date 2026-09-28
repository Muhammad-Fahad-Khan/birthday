import { defineConfig } from 'vite';

export default defineConfig({
  // Relative base so the build works on any static host or sub-path.
  base: './',
  server: {
    port: 5101,
    host: true,
    open: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        manualChunks: {
          three: ['three'],
          motion: ['gsap', 'lenis'],
        },
      },
    },
  },
});
