export const BLOG_STATUS = Object.freeze({
  DRAFT: 'draft',
  PUBLISHED: 'published',
  ARCHIVED: 'archived',
} as const);

export const BLOG_STATUS_VALUES = Object.freeze([
  BLOG_STATUS.DRAFT,
  BLOG_STATUS.PUBLISHED,
  BLOG_STATUS.ARCHIVED,
] as const);

export type BlogStatusValue = (typeof BLOG_STATUS_VALUES)[number];

export const BLOG_LINK_KINDS = Object.freeze({
  REPO: 'repo',
  REF: 'ref',
  DEMO: 'demo',
  OTHER: 'other',
} as const);

export const BLOG_LINK_KIND_VALUES = Object.freeze([
  BLOG_LINK_KINDS.REPO,
  BLOG_LINK_KINDS.REF,
  BLOG_LINK_KINDS.DEMO,
  BLOG_LINK_KINDS.OTHER,
] as const);

export type BlogLinkKindValue = (typeof BLOG_LINK_KIND_VALUES)[number];
