# SEO & GEO (AI Search) Checklist — `apps/web`

## 1. Next.js App Router Metadata

- [ ] `metadata` or `generateMetadata` is **exported directly** from `page.tsx` or `layout.tsx` (sibling files like `generateMetadata.tsx` are ignored unless re-exported).
- [ ] Every indexable route sets `alternates.canonical` to its canonical slug path (no query params on canonicals).
- [ ] Paginated or filtered list views (`/blog?page=2`, `/project?types=...`) set `robots: { index: false, follow: true }`.
- [ ] Dynamic detail routes (`/blog/[id]`, `/project/[id]`) set route-specific `title`, `description` (<= 160 chars, plain text via `stripMarkdown`), `openGraph` (`type: 'article'` for blogs with `publishedTime`, `modifiedTime`, `authors`, `tags`), and `twitter` cards.
- [ ] No placeholder handles (e.g. `@yourhandle`) in `twitter.creator` or `twitter.site`.

## 2. Sitemap, Robots & RSS

- [ ] `src/app/sitemap.ts` dynamically fetches all published blog slugs and projects so `sitemap.xml` never misses dynamic routes.
- [ ] `robots.txt` references the canonical `Sitemap: https://rohangautam.dev/sitemap.xml` and allows indexable routes.
- [ ] `/rss.xml` is dynamically served (or regenerated on publish) using canonical `/blog/${slug}` URLs and `stripMarkdown` summaries.

## 3. Structured Data (JSON-LD)

- [ ] Every `@graph` item has a **unique** `@id` (never share the same `@id` across multiple `SiteNavigationElement` entries).
- [ ] `WebSite.potentialAction` (`SearchAction`) is only included if `/search` actually exists and returns `200`.
- [ ] Blog posts include `BlogPosting` + `BreadcrumbList`; project pages include `SoftwareSourceCode` / `CreativeWork` + `BreadcrumbList`.
- [ ] Validate rendered JSON-LD with Google Rich Results / Schema.org validator rules (no `undefined` required fields, valid ISO-8601 dates).

## 4. GEO / AI Search Readiness

- [ ] Maintain `/llms.txt` at `public/llms.txt` (or dynamic route) summarizing Rohan Kumar's profile, flagship projects, and top technical articles with canonical links.
- [ ] Ensure primary content is present in initial SSR HTML (AI crawlers often do not execute client-side data fetches).
