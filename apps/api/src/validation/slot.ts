import Joi from 'joi';

export const slotSchema = Joi.object({
  name: Joi.string().trim().min(2).max(64).required(),
  email: Joi.string().email().trim().required(),
  date: Joi.date().iso().required(),
  duration: Joi.number().integer().min(15).max(120).default(30),
  message: Joi.string().max(500).trim().allow(''),
  status: Joi.string().valid('booked', 'cancelled').default('booked'),
}).required();

export const slotUpdateSchema = Joi.object({
  status: Joi.string().valid('booked', 'cancelled'),
  date: Joi.date().iso(),
  duration: Joi.number().integer().min(15).max(120),
  message: Joi.string().max(500).trim().allow(''),
})
  .min(1)
  .unknown(true);
