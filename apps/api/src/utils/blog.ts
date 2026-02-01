import type { FilterQuery } from 'mongoose';
import Blog from '../models/Blog';

type AnyObj = Record<string, any>;

// Escape user input for regex safely
const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export function buildBlogQuery(filter: AnyObj): FilterQuery<typeof Blog> {
  const q: AnyObj = {};

  // exact filters
  if (filter.slug) q.slug = String(filter.slug).trim().toLowerCase();
  if (filter.status) q.status = String(filter.status);
  if (typeof filter.isFeatured === 'boolean') q.isFeatured = !!filter.isFeatured;
  if (Array.isArray(filter.tags) && filter.tags.length) {
    // match any of these tags (normalized to lowercase)
    q.tags = { $in: filter.tags.map((t: string) => String(t).trim().toLowerCase()) };
  }
  if (filter.author) {
    // loose, case-insensitive author match
    q.author = new RegExp(escapeRegex(String(filter.author).trim()), 'i');
  }

  // search
  const search = String(filter.q ?? '').trim();
  if (search) {
    // Prefer text search when a text index exists.
    // NOTE: Your schema defines: BlogSchema.index({ title: 'text', content: 'text', tags: 'text' })
    // Do NOT combine $text with regex in the same query.
    if (filter.searchMode === 'regex') {
      // explicit regex mode (optional)
      const re = new RegExp(escapeRegex(search), 'i');
      q.$or = [
        { title: re },
        { content: re },
        { tags: { $elemMatch: re } }, // tags is an array
      ];
    } else {
      // default: use $text
      q.$text = { $search: search };
    }
  }

  return q;
}

export function normalizeBlogBody(body: any) {
  const copy = { ...(body || {}) };

  // Normalize tags
  if (Array.isArray(copy.tags)) {
    copy.tags = Array.from(
      new Set(copy.tags.map((t: any) => String(t).trim().toLowerCase()).filter(Boolean))
    );
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
