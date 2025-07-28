import Joi from 'joi';

export const profileSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  bio: Joi.string().optional(),
  avatarUrl: Joi.string().uri().optional(),
  title: Joi.string().required(),
  yearsOfExperience: Joi.number().min(0).required(),
  skills: Joi.array().items(Joi.string()).required(),
  githubUrl: Joi.string().uri().optional(),
  linkedinUrl: Joi.string().uri().optional(),
  location: Joi.string().optional(),
});

export const profileUpdateSchema = Joi.object({
  name: Joi.string(),
  email: Joi.string().email(),
  title: Joi.string(),
  yearsOfExperience: Joi.number().min(0),
  skills: Joi.array().items(Joi.string()),
  bio: Joi.string(),
  avatarUrl: Joi.string().uri(),
  githubUrl: Joi.string().uri(),
  linkedinUrl: Joi.string().uri(),
  location: Joi.string(),
})
  .min(1)
  .unknown(true);
