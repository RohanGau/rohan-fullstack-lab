import type { FilterQuery } from 'mongoose';
import { IBlogDb } from '@fullstack-lab/types';

export function buildBlogQuery(raw: Record<string, any>): FilterQuery<IBlogDb> {
  const q: FilterQuery<IBlogDb> = {};

  // Full-text or regex on q
  if (raw.q) {
    const term = String(raw.q).trim();
    if (term) {
      q.$or = [
        { $text: { $search: term } },
        { title: { $regex: term, $options: 'i' } },
        { content: { $regex: term, $options: 'i' } },
        { tags: { $regex: term, $options: 'i' } },
      ];
    }
  }

  // by tags (any match)
  if (raw.tags) {
    const arr = Array.isArray(raw.tags) ? raw.tags : [raw.tags];
    const tags = arr.map((t) => String(t).toLowerCase().trim()).filter(Boolean);
    if (tags.length) q.tags = { $in: tags };
  }

  // author (case-insensitive contains)
  if (raw.author) {
    q.author = { $regex: String(raw.author).trim(), $options: 'i' };
  }

  // isFeatured
  if (typeof raw.isFeatured !== 'undefined') {
    const v = raw.isFeatured === true || raw.isFeatured === 'true';
    q.isFeatured = v;
  }

  // status
  if (raw.status) {
    q.status = String(raw.status).toLowerCase();
  }

  // slug exact
  if (raw.slug) {
    q.slug = String(raw.slug).toLowerCase().trim();
  }

  // published range
  const gte = raw.date_gte ? new Date(raw.date_gte) : undefined;
  const lte = raw.date_lte ? new Date(raw.date_lte) : undefined;
  if (gte || lte) {
    q.publishedAt = {};
    if (gte) (q.publishedAt as any).$gte = gte;
    if (lte) (q.publishedAt as any).$lte = lte;
  }

  // ids (react-admin bulk fetch)
  if (raw.ids) {
    const ids = Array.isArray(raw.ids) ? raw.ids : [raw.ids];
    q._id = { $in: ids };
  }

  // Any additional exact matches (safe allowlist)
  const direct: Array<keyof IBlogDb> = ['readingTime'];
  for (const k of direct) {
    if (raw[k] !== undefined) (q as any)[k] = raw[k];
  }

  return q;
}

export function normalizeBlogBody(body: any) {
  const copy = { ...(body || {}) };

  // Normalize tags
  if (Array.isArray(copy.tags)) {
    copy.tags = Array.from(new Set(copy.tags.map((t: any) => String(t).trim().toLowerCase()).filter(Boolean)));
  }

  // Normalize links
  if (Array.isArray(copy.links)) {
    copy.links = copy.links
      .map((l: any) => ({
        url: l?.url?.trim(),
        label: l?.label?.trim() || undefined,
        kind: (l?.kind || 'other').toLowerCase(),
      }))
      .filter((l: any) => !!l.url);
  }

  // Slug to lowercase, trimmed
  if (copy.slug) {
    copy.slug = String(copy.slug).trim().toLowerCase();
  }

  // If status moved to 'published' and publishedAt absent → set now (model also guards this)
  if (copy.status === 'published' && !copy.publishedAt) {
    copy.publishedAt = new Date();
  }

  return copy;
}

