# Performance & Core Web Vitals Checklist — `apps/web`

Target thresholds (75th percentile mobile & desktop):

- **LCP** <= 2.5s (aim < 1.5s)
- **INP** <= 200ms (aim < 100ms)
- **CLS** <= 0.1 (aim < 0.05)

## 1. Rendering Strategy (RSC & Edge)

- [ ] Pages (`page.tsx`) are **React Server Components** by default. Never put `'use client'` at the top of `page.tsx`.
- [ ] Do not wrap above-the-fold hero or primary content in `dynamic(..., { ssr: false })` or `withClientFallback(..., { ssr: false })`.
- [ ] Use `React.cache()` in `src/lib/server/*` to deduplicate API calls between `generateMetadata` and `page.tsx`.
- [ ] Dynamic routes targeting Cloudflare Pages declare `export const runtime = 'edge'` and appropriate `revalidate`.

## 2. Images, Fonts & Layout Stability (LCP / CLS)

- [ ] Use `next/image` (avoid raw `<img>`) with explicit `width`/`height` or `fill` inside an `aspect-*` container, plus accurate `sizes`.
- [ ] Mark the single above-the-fold hero/cover image with `priority` (do not overuse `priority` on below-the-fold images).
- [ ] Fonts loaded via `next/font/google` must match CSS variables in `src/app/globals.css` (`--font-sans`, `--font-mono`).

## 3. Third-Party Scripts & Embeds

- [ ] Never mount heavy third-party `<iframe>`s (e.g., Google Maps `FooterMap`) in the global `Footer`. Scope embeds to their dedicated route (`/contact`) or behind a click-to-load facade.
- [ ] Load analytics/widgets with `strategy="afterInteractive"` or `lazyOnload`.
- [ ] Prefer server-rendered Markdown/MDX over shipping heavy client-side markdown parsers when interactivity isn't needed.
