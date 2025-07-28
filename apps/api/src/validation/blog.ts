import Joi from 'joi';

export const blogSchema = Joi.object({
  title: Joi.string().required(),
  content: Joi.string().required(),
  author: Joi.string().required(),
  tags: Joi.array().items(Joi.string()).optional(),
});

export const blogUpdateSchema = Joi.object({
  title: Joi.string(),
  content: Joi.string(),
  author: Joi.string(),
  tags: Joi.array().items(Joi.string()),
})
  .min(1)
  .unknown(true);
