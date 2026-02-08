import Joi from 'joi';

export const authLoginSchema = Joi.object({
  username: Joi.string().trim().min(3).max(120),
  email: Joi.string().email(),
  password: Joi.string().min(6).required(),
}).or('username', 'email');

export const authTokenExchangeSchema = Joi.object({
  token: Joi.string().trim().min(10),
});

export const authRefreshSchema = Joi.object({
  refreshToken: Joi.string().trim().min(20).required(),
});

export const authLogoutSchema = Joi.object({
  refreshToken: Joi.string().trim().min(20).required(),
});
