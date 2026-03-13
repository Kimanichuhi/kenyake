import { defineConfig } from 'vite';          // ← Change to 'vite', not 'vitest/config'
import react from '@vitejs/plugin-react-swc';
import path from 'path';

export default defineConfig({
  plugins: [react()],

  // Path alias for @ → src/
  resolve: {
    alias: {
      // Use this safer syntax to avoid any __dirname weirdness in some envs
      '@': path.resolve(__dirname, './src'),
      // Optional: add more if needed
      // '@components': path.resolve(__dirname, './src/components'),
    },
  },

  // If you want Vitest settings, create a SEPARATE vitest.config.ts
  // and extend from this one, or put test: {} only if running tests via vite
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
  },
});
