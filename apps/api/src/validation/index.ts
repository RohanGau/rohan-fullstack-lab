import { ObjectSchema } from 'joi';
import logger from '../utils/logger';
import { Request, Response, NextFunction } from 'express';
import { CMS_ERROR_MESSAGES as ERROR_MESSAGES } from '../utils/constant';

export const validateSchema =
  (schema: ObjectSchema) => (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      allowUnknown: true,
      stripUnknown: { objects: true },
      convert: true,
    });

    if (error) {
      logger.warn({ error }, 'Validation failed');
      const errors = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message.replace(/"/g, ''),
      }));
      return res.status(400).json({ msg: ERROR_MESSAGES.VALIDATION_ERROR, error: errors });
    }

    req.validatedBody = value ?? {};
    next();
  };
