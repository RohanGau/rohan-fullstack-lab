import Joi from 'joi';

const createTodoSchema = Joi.object({
  title: Joi.string().required().min(3).max(300).messages({
    'any.required': 'Title is required',
    'string.empty': 'Title cannot be empty',
    'string.min': 'Title must be at least 3 characters long',
    'string.max': 'Title must not exceed 300 characters',
  }),
  description: Joi.string().allow('', null).optional(),
});

export { createTodoSchema };
