/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  // Relative base so the build works on GitHub Pages sub-paths as well as Netlify / Vercel.
  base: './',
  plugins: [react(), tailwindcss()],
  // Phaser is only reached through a lazy import, so pre-bundle it or the dev server reloads on the first mission.
  optimizeDeps: { include: ['phaser'] },
  test: {
    include: ['src/**/*.test.ts'],
    environment: 'node',
  },
});
