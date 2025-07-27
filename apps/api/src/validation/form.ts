import Joi from 'joi';

const answerOptionSchema = Joi.object({
  id: Joi.string().required().messages({
    'any.required': 'Answer option Id is required',
    'string.empty': 'Answer Option Id cannot be empty',
  }),
  value: Joi.string().required().messages({
    'any.required': 'Answer opion value is required',
    'string.empty': 'Answer option value cannot be empty',
  }),
  label: Joi.string().required().messages({
    'any.required': 'Answer opion label is required',
    'string.empty': 'Answer option label cannot be empty',
  }),
  nextQuestionId: Joi.string().allow(null, '').optional(),
});

const questionSchema = Joi.object({
  id: Joi.string().required().messages({
    'any.required': 'pQuestion Id is required',
    'string.empty': 'Question Id cannot be empty',
  }),
  text: Joi.string().required().messages({
    'any.required': 'Question text is required',
    'string.empty': 'Question text cannot be empty',
    'string.min': 'Question text must be at least 3 character long',
  }),
  fieldType: Joi.string().valid('text', 'select').required().messages({
    'any.required': 'Field type is required',
    'string.empty': 'Field type cannot be empty',
    'any.only': "Field type must be either 'text' or 'select'",
  }),
  answerOptions: Joi.array()
    .items(answerOptionSchema)
    .when('fieldType', {
      is: 'select',
      then: Joi.array().min(1).required().messages({
        'array.min': 'Select type question must have at least one answer option',
        'any.required': 'Answer options are required for select type questions',
      }),
      otherwise: Joi.array().max(0).messages({
        'array.max': `Answer options are not allowed for {{.field}} type questions`,
      }),
    })
    .default([]),
});

const createFormSchema = Joi.object({
  name: Joi.string().required().min(3).max(300).messages({
    'any.required': 'Form name is required',
    'string.empty': 'Form name cannot be empty',
    'string.min': 'Form name must be at least 3 characters long',
    'string.max': 'Form name must not exceed 300 characters',
  }),
  description: Joi.string().allow('', null),
  questions: Joi.array().items(questionSchema).min(1).required().messages({
    'any.required': 'Form must contain at least one question',
    'array.min': 'Form must contain at least one question',
  }),
});

export { createFormSchema, answerOptionSchema, questionSchema };
