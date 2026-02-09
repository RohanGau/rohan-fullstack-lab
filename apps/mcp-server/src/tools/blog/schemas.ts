import { BLOG_LINK_KIND_VALUES, BLOG_STATUS_VALUES } from '@fullstack-lab/constants';
import { z } from 'zod';

export const blogStatusSchema = z.enum(BLOG_STATUS_VALUES);
const blogLinkKindSchema = z.enum(BLOG_LINK_KIND_VALUES);

export const blogLinkSchema = z.object({
  url: z.string().url(),
  label: z.string().max(80).optional(),
  kind: blogLinkKindSchema.optional(),
});

export const createDraftInputShape = {
  title: z.string().min(3).max(180),
  content: z.string().min(10),
  author: z.string().min(1),
  summary: z.string().max(500).optional(),
  slug: z
    .string()
    .regex(/^[a-z0-9-]+$/)
    .optional(),
  tags: z.array(z.string().min(1)).default([]),
  links: z.array(blogLinkSchema).default([]),
  coverImageUrl: z.string().url().optional(),
  readingTime: z.number().int().min(1).max(120).optional(),
  isFeatured: z.boolean().optional(),
};

export const listRecentInputShape = {
  limit: z.number().int().min(1).max(100).optional(),
  status: blogStatusSchema.optional(),
  search: z.string().max(200).optional(),
  tag: z.string().max(80).optional(),
};

export const getByIdOrSlugInputShape = {
  id: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
  status: blogStatusSchema.optional(),
};

export const updateDraftInputShape = {
  id: z.string().min(1),
  title: z.string().min(3).max(180).optional(),
  slug: z
    .string()
    .regex(/^[a-z0-9-]+$/)
    .optional(),
  content: z.string().min(10).optional(),
  summary: z.string().max(500).optional(),
  author: z.string().min(1).optional(),
  tags: z.array(z.string().min(1)).optional(),
  links: z.array(blogLinkSchema).optional(),
  coverImageUrl: z.string().url().optional(),
  readingTime: z.number().int().min(1).max(120).optional(),
  isFeatured: z.boolean().optional(),
};

export const deleteDraftInputShape = {
  id: z.string().min(1),
};

export const publishInputShape = {
  id: z.string().min(1),
  publishedAt: z.string().datetime().optional(),
};
