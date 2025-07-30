import Joi from 'joi';

const skillSchema = Joi.object({
  name: Joi.string().min(1).required(),
  rating: Joi.number().min(1).max(10).required(),
  yearsOfExperience: Joi.number().min(0).required(),
});

export const profileSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  bio: Joi.string().optional(),
  avatarUrl: Joi.string().uri().optional(),
  title: Joi.string().required(),
  yearsOfExperience: Joi.number().min(0).required(),
  skills: Joi.array().items(skillSchema).required(),
  githubUrl: Joi.string().uri().optional(),
  linkedinUrl: Joi.string().uri().optional(),
  location: Joi.string().optional(),
});

export const profileUpdateSchema = Joi.object({
  name: Joi.string(),
  email: Joi.string().email(),
  title: Joi.string(),
  yearsOfExperience: Joi.number().min(0),
  skills: Joi.array().items(skillSchema).required(),
  bio: Joi.string(),
  avatarUrl: Joi.string().uri(),
  githubUrl: Joi.string().uri(),
  linkedinUrl: Joi.string().uri(),
  location: Joi.string(),
})
  .min(1)
  .unknown(true);
