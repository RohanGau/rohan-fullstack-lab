import Joi from 'joi';

const linkObj = Joi.object({
  url: Joi.string().uri().required(),
  label: Joi.string().trim().max(80).optional(),
  kind: Joi.string().valid('repo', 'ref', 'demo', 'other').default('other'),
});

export const blogSchema = Joi.object({
  title: Joi.string().trim().min(3).max(180).required(),
  slug: Joi.string()
    .trim()
    .lowercase()
    .pattern(/^[a-z0-9-]+$/)
    .optional(),
  content: Joi.string().trim().min(10).required(),
  summary: Joi.string().trim().max(500).optional(),
  author: Joi.string().trim().required(),
  tags: Joi.array().items(Joi.string().trim().lowercase()).default([]),
  links: Joi.array().items(linkObj).default([]),
  coverImageUrl: Joi.string().uri().optional(),
  readingTime: Joi.number().integer().min(1).max(120).optional(),
  isFeatured: Joi.boolean().default(false),
  status: Joi.string().valid('draft', 'published', 'archived').default('draft'),
  publishedAt: Joi.date().optional(), // will be set if status === 'published'
});

export const blogUpdateSchema = Joi.object({
  title: Joi.string().trim().min(3).max(180),
  slug: Joi.string()
    .trim()
    .lowercase()
    .pattern(/^[a-z0-9-]+$/),
  content: Joi.string().trim().min(10),
  summary: Joi.string().trim().max(500),
  author: Joi.string().trim(),
  tags: Joi.array().items(Joi.string().trim().lowercase()),
  links: Joi.array().items(linkObj),
  coverImageUrl: Joi.string().uri(),
  readingTime: Joi.number().integer().min(1).max(120),
  isFeatured: Joi.boolean(),
  status: Joi.string().valid('draft', 'published', 'archived'),
  publishedAt: Joi.date(),
})
  .min(1)
  .unknown(false);
