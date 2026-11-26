import { fileURLToPath } from 'node:url';
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
    resolve: {
      alias: {
        // @fullstack-lab/constants compiles to CommonJS for Node; point Vite at ESM TypeScript source.
        '@fullstack-lab/constants': fileURLToPath(
          new URL('../../packages/constants/src/index.ts', import.meta.url)
        ),
      },
    },
    server: {
      port: 5174,
      strictPort: true,
      allowedHosts: ['local.rohangautam.dev'],
    },
    build: {
      outDir: 'dist/admin',
      emptyOutDir: true,
      sourcemap: false,
      rolldownOptions: {
        output: {
          codeSplitting: {
            groups: [
              {
                name: 'index',
                test: /node_modules[\\/](react|react-dom|scheduler|@emotion|@tanstack|clsx|@popperjs|@mui[\\/](system|utils|private-theming|styled-engine|icons-material|material[\\/](?:esm[\\/])?(AppBar|Backdrop|Box|Button|ButtonBase|Card|CardActions|CardContent|Chip|CircularProgress|ClickAwayListener|CssBaseline|Dialog|DialogActions|DialogContent|DialogTitle|Divider|Drawer|Fade|Grow|IconButton|List|ListItem|ListItemButton|ListItemIcon|ListItemText|Modal|Paper|Popover|Popper|Portal|Slide|Stack|SvgIcon|Toolbar|Tooltip|Typography|Alert|Zoom|styles|utils|useTheme)))|packages[\\/](constants|types)[\\/]|src[\\/](access|routes|shell|auth|config|theme|lib|main|App)/,
                minSize: 0,
                includeDependenciesRecursively: false,
              },
              {
                name: 'data-grid',
                test: /@mui[\\/]x-data-grid|src[\\/]resources[\\/]ResourceList/,
                minSize: 0,
                includeDependenciesRecursively: false,
              },
            ],
          },
        },
      },
    },
    test: {
      globals: true,
      environment: 'jsdom',
      testTimeout: 15000,
      setupFiles: ['./src/test/setup.ts'],
      css: false,
      env: {
        VITE_API_URL: 'http://api.test',
        VITE_GOOGLE_CLIENT_ID: 'test-client-id.apps.googleusercontent.com',
      },
    },
  };
});
