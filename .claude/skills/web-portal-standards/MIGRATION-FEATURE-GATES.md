# Feature & Migration End-to-End Gates — `apps/web`

Use this gate list whenever building a new feature, migrating routes/components, or upgrading dependencies in `apps/web`.

## Phase 1: Design & Pre-Flight

- [ ] Confirm shared DTOs live in `@fullstack-lab/types` (`packages/types`), not duplicated in `apps/web/src/types`.
- [ ] Decide rendering mode: Server Component (default, Edge/ISR) vs. small `'use client'` island.
- [ ] Identify SEO impact: Does this route need `generateMetadata`, canonical URL, `sitemap.ts` entry, JSON-LD, or `llms.txt` update?

## Phase 2: Implementation

- [ ] Follow `PERFORMANCE-CWV-CHECKLIST.md`, `SEO-GEO-CHECKLIST.md`, and `SECURITY-A11Y-CHECKLIST.md`.
- [ ] Wrap client-side interactive boundaries with `ErrorBoundary` and meaningful loading skeletons (matching final layout dimensions to prevent CLS).
- [ ] Track key user journeys/conversions via `GoogleAnalytics` helpers and capture unexpected errors via Sentry (`captureClientException`).
- [ ] Write unit/component tests (or E2E smoke tests) for new logic, hooks, and critical user flows.

## Phase 3: Verification Before Completion

Run and verify all of the following after your final edit:

1. `pnpm --filter web exec tsc --noEmit` — 0 TypeScript errors.
2. `pnpm --filter web lint` — 0 ESLint / `jsx-a11y` errors.
3. `pnpm web:build` — Cloudflare Pages (`@cloudflare/next-on-pages`) Edge build succeeds cleanly.
4. Inspect generated HTML / metadata (`<title>`, `<meta name="description">`, `<link rel="canonical">`, `og:image`, JSON-LD) on affected routes.
