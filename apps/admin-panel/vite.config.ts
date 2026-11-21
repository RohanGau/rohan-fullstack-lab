import react from '@vitejs/plugin-react';
import { loadEnv } from 'vite';
import type { PluginOption } from 'vite';
import { defineConfig } from 'vitest/config';
import { cloudflarePages } from './cloudflare-pages.ts';
import { assertRequiredEnv } from './env-check.ts';

export default defineConfig(({ mode, command }) => {
  const plugins: PluginOption[] = [react()];
  if (command === 'build' && mode !== 'test') {
    const env = loadEnv(mode, process.cwd(), 'VITE_');
    assertRequiredEnv(env);
    plugins.push(cloudflarePages(env.VITE_API_URL!));
  }
  return {
    base: '/admin/',
    plugins,
    server: { port: 5174 },
    build: { outDir: 'dist/admin', emptyOutDir: true, sourcemap: false },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: ['./src/test/setup.ts'],
      css: false,
      env: {
        VITE_API_URL: 'http://api.test',
        VITE_GOOGLE_CLIENT_ID: 'test-client-id.apps.googleusercontent.com',
      },
    },
  };
});
