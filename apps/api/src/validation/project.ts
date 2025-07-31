import Joi from 'joi';

export const projectSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().required(),
  company: Joi.string().optional(),
  role: Joi.string().optional(),
  techStack: Joi.array().items(Joi.string()).required(),
  features: Joi.array().items(Joi.string()).optional(),
  link: Joi.string().uri().optional(),
  year: Joi.number().integer().min(2000).max(3000).optional(),
  thumbnailUrl: Joi.string().uri().optional(),
  type: Joi.string().valid('web', 'mobile', 'api', 'cli', 'tool', 'library').optional(),
});

export const projectUpdateSchema = projectSchema.fork(
  Object.keys(projectSchema.describe().keys),
  (field) => field.optional()
);
