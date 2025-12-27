import { defineConfig } from 'vite';

export default defineConfig({
  // Base path for static file deployment
  base: './',

  build: {
    // Output directory for production build
    outDir: 'dist',

    // Generate source maps for debugging
    sourcemap: true,

    // Ensure assets are relative for file:// protocol support
    assetsDir: 'assets',
  },

  server: {
    // Development server port
    port: 3000,

    // Open browser on server start
    open: true,
  },

  // Enable ?raw imports for source file bundling (ADR-002)
  // Vite supports ?raw imports natively - no additional config needed
  // Example: import demoSource from './demos/ParticleDemo.ts?raw'
  assetsInclude: [],
});
