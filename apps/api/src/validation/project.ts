import Joi from 'joi';

export const projectSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().required(),
  company: Joi.string(),
  role: Joi.string(),
  techStack: Joi.array().items(Joi.string()).required(),
  features: Joi.array().items(Joi.string()),
  link: Joi.string().uri(),
  year: Joi.number().integer().min(2000).max(3000),
  thumbnailUrl: Joi.string().uri(),
  type: Joi.string().valid('web', 'mobile', 'api', 'cli', 'tool', 'library'),
});

export const projectUpdateSchema = Joi.object({
  title: Joi.string(),
  description: Joi.string(),
  company: Joi.string(),
  role: Joi.string(),
  techStack: Joi.array().items(Joi.string()),
  features: Joi.array().items(Joi.string()),
  link: Joi.string().uri(),
  year: Joi.number().integer().min(2000).max(3000),
  thumbnailUrl: Joi.string().uri(),
  type: Joi.string().valid('web', 'mobile', 'api', 'cli', 'tool', 'library'),
})
  .min(1)
  .unknown(true);
