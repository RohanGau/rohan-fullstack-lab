import Joi from 'joi';

const allowedTypes = ['web', 'mobile', 'api', 'cli', 'tool', 'library', 'backend', 'frontend', 'desktop'] as const;

const linkObj = Joi.object({
  url: Joi.string().uri().required(),
  label: Joi.string().trim().max(80).optional(),
  kind: Joi.string().valid('live','repo','docs','demo','design','other').default('other'),
});

export const projectSchema = Joi.object({
  title: Joi.string().trim().min(3).max(140).required(),
  description: Joi.string().trim().min(10).required(),
  company: Joi.string().trim(),
  role: Joi.string().trim(),
  techStack: Joi.array().items(Joi.string().trim()).default([]),
  features: Joi.array().items(Joi.string().trim()).default([]),
  links: Joi.array().items(linkObj).default([]),
  link: Joi.string().uri(),
  year: Joi.number().integer().min(1990).max(new Date().getFullYear() + 1),
  thumbnailUrl: Joi.string().uri(),
  types: Joi.array().items(Joi.string().valid(...allowedTypes)).default([]),
  type: Joi.string().valid(...allowedTypes),
  isFeatured: Joi.boolean().default(false),
});

export const projectUpdateSchema = Joi.object({
  title: Joi.string().trim().min(3).max(140),
  description: Joi.string().trim().min(10),
  company: Joi.string().trim(),
  role: Joi.string().trim(),
  techStack: Joi.array().items(Joi.string().trim()),
  features: Joi.array().items(Joi.string().trim()),
  links: Joi.array().items(linkObj),
  link: Joi.string().uri(),
  year: Joi.number().integer().min(1990).max(new Date().getFullYear() + 1),
  thumbnailUrl: Joi.string().uri(),
  types: Joi.array().items(Joi.string().valid(...allowedTypes)),
  type: Joi.string().valid(...allowedTypes),
  isFeatured: Joi.boolean(),
})
  .min(1)
  .unknown(true);
