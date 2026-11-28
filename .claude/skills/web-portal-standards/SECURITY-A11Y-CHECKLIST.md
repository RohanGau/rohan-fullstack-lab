# Security & Accessibility Checklist — `apps/web`

## 1. Security & CSP

- [ ] Keep security headers synchronized between `next.config.ts` and `public/_headers` (single source of truth preferred).
- [ ] Avoid `'unsafe-eval'` in production `Content-Security-Policy` where possible; keep `frame-ancestors 'none'`, `object-src 'none'`, `base-uri 'self'`.
- [ ] Omit or disable deprecated `X-XSS-Protection` (rely on CSP).
- [ ] Sanitize or safely render all user/CMS-authored Markdown (never use `dangerouslySetInnerHTML` for untrusted HTML; use `react-markdown` without raw HTML plugins or sanitize with DOMPurify).
- [ ] Validate all route params (`isMongoId`, slug trimming) and fail closed with `notFound()`.
- [ ] Protect public mutation forms (contact, slot booking) with Cloudflare Turnstile + server-side verification.

## 2. Accessibility (WCAG 2.2 AA)

- [ ] Skip-to-content link (`<a href="#content">`) is present and targets `<main id="content">`.
- [ ] Exactly one `<h1>` per page; heading levels (`h1` → `h2` → `h3`) do not skip levels.
- [ ] Every form control (`Input`, `Textarea`, `Select`) has an explicit `<Label htmlFor="...">` or `aria-label` (never `placeholder` alone).
- [ ] Field validation errors are linked with `aria-invalid` and `aria-describedby`, and global alerts use `role="alert"` / `aria-live="polite"`.
- [ ] Interactive controls have visible `focus-visible` rings, keyboard navigation works, and icon-only buttons have `aria-label`.
- [ ] All meaningful images have descriptive `alt` text; decorative icons use `aria-hidden="true"`.
