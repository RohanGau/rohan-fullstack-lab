import Joi from 'joi';

export const createOperatorSchema = Joi.object({
  email: Joi.string().trim().lowercase().email().max(254).required(),
  roles: Joi.array().items(Joi.string().trim().max(60)).max(10).unique().default([]),
});
