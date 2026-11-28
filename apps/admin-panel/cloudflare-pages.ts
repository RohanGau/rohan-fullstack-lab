import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import type { Plugin } from 'vite';

/**
 * Content security policy for the Admin panel: Google sign-in, the API and the
 * panel's own assets, and nothing else. MUI's runtime styles need inline styles.
 */
export function buildHeaders(apiUrl: string): string {
  const apiOrigin = new URL(apiUrl).origin;
  const csp = [
    "default-src 'self'",
    "script-src 'self' https://accounts.google.com/gsi/client",
    "style-src 'self' 'unsafe-inline' https://accounts.google.com/gsi/style",
    "img-src 'self' https: data: blob:",
    `connect-src 'self' ${apiOrigin} https://accounts.google.com/gsi/ https://*.r2.cloudflarestorage.com`,
    'frame-src https://accounts.google.com/gsi/',
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "object-src 'none'",
  ].join('; ');
  return [
    '/admin/*',
    `  Content-Security-Policy: ${csp}`,
    '  X-Content-Type-Options: nosniff',
    '  Referrer-Policy: strict-origin-when-cross-origin',
    '  X-Frame-Options: DENY',
    '',
    '/admin/assets/*',
    '  Cache-Control: public, max-age=31536000, immutable',
    '',
  ].join('\n');
}

/** Root lands on /admin/, and deep links under /admin resolve to the SPA entry; real files win. */
export const REDIRECTS =
  ['/ /admin/ 302', '/admin /admin/ 301', '/admin/* /admin/index.html 200'].join('\n') + '\n';

/**
 * The Worker route forwards /admin/* to the Pages project unchanged, so the app
 * is emitted under dist/admin and the Pages control files sit at the dist root.
 */
export function cloudflarePages(apiUrl: string): Plugin {
  let root = process.cwd();
  return {
    name: 'admin-panel-cloudflare-pages',
    apply: 'build',
    configResolved(config) {
      root = config.root;
    },
    closeBundle() {
      const dist = join(root, 'dist');
      mkdirSync(dist, { recursive: true });
      writeFileSync(join(dist, '_headers'), buildHeaders(apiUrl));
      writeFileSync(join(dist, '_redirects'), REDIRECTS);
    },
  };
}
