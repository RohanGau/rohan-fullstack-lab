export const ALLOWED_IMAGE_ORIGINS = [
  'https://assets.rohangautam.dev',
  'https://assets-stage.rohangautam.dev',
  'https://pub-92ca52f522664b02af9bc8a7906e3013.r2.dev',
  'https://cdn.discordapp.com',
  'https://pelocal.com',
  'https://avatars.githubusercontent.com',
  'https://www.google-analytics.com',
  'https://www.googletagmanager.com',
];

/**
 * Single source of truth for security headers shared between Next.js (`next.config.ts`)
 * and Cloudflare Pages (`public/_headers`).
 */
export function buildCsp({ isDev = false } = {}) {
  const scriptSrc = [
    "'self'",
    "'unsafe-inline'",
    ...(isDev ? ["'unsafe-eval'"] : []),
    'https://challenges.cloudflare.com',
    'https://static.cloudflareinsights.com',
    'https://www.googletagmanager.com',
    'https://www.google-analytics.com',
  ].join(' ');

  const connectSrc = [
    "'self'",
    ...(isDev ? ['http://localhost:*', 'ws://localhost:*'] : []),
    'https://api.rohangautam.dev',
    'https://api-stage.rohangautam.dev',
    'https://rohan-backend-api-stage.fly.dev',
    'https://challenges.cloudflare.com',
    'https://static.cloudflareinsights.com',
    'https://cloudflareinsights.com',
    'https://*.sentry.io',
    'https://www.google-analytics.com',
    'https://analytics.google.com',
    'https://*.analytics.google.com',
    'https://*.googletagmanager.com',
  ].join(' ');

  return [
    "default-src 'self'",
    `script-src ${scriptSrc}`,
    "style-src 'self' 'unsafe-inline'",
    `img-src 'self' data: blob: ${ALLOWED_IMAGE_ORIGINS.join(' ')}`,
    "font-src 'self' data:",
    `connect-src ${connectSrc}`,
    'frame-src https://challenges.cloudflare.com https://www.google.com https://maps.google.com',
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
  ].join('; ');
}

export function getSecurityHeaders({ isDev = false } = {}) {
  return [
    {
      key: 'Strict-Transport-Security',
      value: 'max-age=31536000; includeSubDomains',
    },
    {
      key: 'Content-Security-Policy',
      value: buildCsp({ isDev }),
    },
    {
      key: 'X-Frame-Options',
      value: 'DENY',
    },
    {
      key: 'X-Content-Type-Options',
      value: 'nosniff',
    },
    {
      key: 'Referrer-Policy',
      value: 'strict-origin-when-cross-origin',
    },
    {
      key: 'Permissions-Policy',
      value: 'camera=(), microphone=(), geolocation=(), payment=()',
    },
    {
      key: 'Cross-Origin-Opener-Policy',
      value: 'same-origin-allow-popups',
    },
  ];
}

export function renderCloudflareHeadersFile() {
  const headers = getSecurityHeaders({ isDev: false });
  const lines = [
    '# Cloudflare Pages Security Headers (AUTO-GENERATED — do not edit directly)',
    '# Source of truth: apps/web/security-headers.mjs',
    '# Regenerate with: pnpm --filter web sync:headers',
    '',
    '/*',
    ...headers.map((h) => `  ${h.key}: ${h.value}`),
    '',
  ];
  return lines.join('\n');
}
