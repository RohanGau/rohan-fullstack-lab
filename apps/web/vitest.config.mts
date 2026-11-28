import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}', 'src/**/*.spec.{ts,tsx}'],
    css: false,
    env: {
      NEXT_PUBLIC_API_URL: 'http://api.test',
      NEXT_PUBLIC_SITE_URL: 'https://rohangautam.dev',
      NEXT_PUBLIC_CDN_URL: 'https://assets.rohangautam.dev',
      NEXT_PUBLIC_TURNSTILE_SITE_KEY: '1x00000000000000000000AA',
    },
  },
});
