---
name: web-portal-standards
description: 'End-to-end 2026 top-ranking web portal standards for apps/web (Next.js 15 + React 19 + Cloudflare Pages). Mandatory for any feature, migration, page/route addition, SEO change, or UI refactor in apps/web.'
---

# Web Portal Standards (`apps/web`)

Every feature, migration, route, or refactor in `apps/web` **must** satisfy top-ranking portal standards across five pillars: **Rendering & CWV**, **Technical SEO & GEO**, **Security**, **Accessibility**, and **Verification Gates**.

Load the relevant checklist(s) below before designing or editing `apps/web`:

- **Rendering, RSC & Core Web Vitals (LCP / INP / CLS):** [PERFORMANCE-CWV-CHECKLIST.md](./PERFORMANCE-CWV-CHECKLIST.md)
- **Technical SEO, Metadata, Sitemap, RSS, JSON-LD & GEO (`llms.txt`):** [SEO-GEO-CHECKLIST.md](./SEO-GEO-CHECKLIST.md)
- **Security, CSP & Accessibility (WCAG 2.2 AA):** [SECURITY-A11Y-CHECKLIST.md](./SECURITY-A11Y-CHECKLIST.md)
- **Feature & Migration End-to-End Gates:** [MIGRATION-FEATURE-GATES.md](./MIGRATION-FEATURE-GATES.md)

## Non-Negotiable Rules (Quick Reference)

1. **RSC First — No CSR-Only Page Shells:** Never mark `src/app/**/page.tsx` with `'use client'` or wrap entire pages in `ssr: false` (`withClientFallback` with `ssr: false`). Fetch initial data in Server Components (Edge/ISR) and push `'use client'` down to small interactive islands.
2. **Metadata Must Be Directly Exported:** Never leave `generateMetadata` in a standalone sibling file without re-exporting it from `page.tsx` or `layout.tsx` (`export { generateMetadata } from './generateMetadata'`). Every dynamic detail route (`/blog/[id]`, `/project/[id]`) must have route-specific metadata, canonical URL, and OpenGraph tags.
3. **Dynamic Discovery (Sitemap & RSS):** All published dynamic routes must be included in `src/app/sitemap.ts` and `/rss.xml` using canonical slugs (never raw IDs that trigger redirects) and stripped plain-text descriptions.
4. **Valid, Truthful JSON-LD:** Never ship placeholder handles (`@yourhandle`), dead `SearchAction` URLs (`/search` if unimplemented), or duplicate `@id` values in `@graph`.
5. **Accessible Forms & Clean Semantics:** Every form input must have an associated `<Label htmlFor>` (or `aria-label`) and `aria-describedby` error linkage. Maintain a single `<h1>` per page and strict heading hierarchy.
6. **Edge & Bundle Discipline:** Keep `apps/web` compatible with `@cloudflare/next-on-pages` (`export const runtime = 'edge'` on dynamic routes), use `next/image` with explicit dimensions/`sizes`, avoid global third-party `<iframe>`s in `Footer`, and keep `globals.css` font variables aligned with `next/font`.
7. **Verification Before Done:** Run `pnpm --filter web exec tsc --noEmit`, `pnpm --filter web lint`, and `pnpm web:build` (or verify route rendering) before concluding any `apps/web` feature or migration.
