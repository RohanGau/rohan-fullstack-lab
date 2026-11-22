import Joi from 'joi';

const roleName = Joi.string()
  .trim()
  .pattern(/^[a-z][a-z0-9_]{1,39}$/)
  .messages({ 'string.pattern.base': 'name must be lower-case words joined by underscores' });

const permissions = Joi.array().items(Joi.string().trim().max(60)).unique().max(100);

export const createRoleSchema = Joi.object({
  name: roleName.required(),
  permissions: permissions.default([]),
});

export const updateRoleSchema = Joi.object({ name: roleName, permissions }).min(1);

export const assignRolesSchema = Joi.object({
  roles: Joi.array().items(Joi.string().trim().max(60)).max(10).unique().required(),
});
