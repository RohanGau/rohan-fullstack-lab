import mongoose from 'mongoose';
import logger from '../utils/logger';
import { Request, Response, NextFunction } from 'express';
import Todo from '../models/todoConfiguration';
import { createTodoSchema } from '../validation/todo';
import { ERROR_MESSAGES } from '../utils';

export const validateTodoCreation = (req: Request, res: Response, next: NextFunction) => {
  const { error, value } = createTodoSchema.validate(req.body, { abortEarly: false });
  if (error) {
    logger.warn({ error }, 'Validation failed for todo creation');
    const erros = error.details.map((detail) => ({
      field: detail.path.join('.'),
      message: detail.message.replace(/"/g, ''),
    }));
    return res.status(400).json({ msg: ERROR_MESSAGES.VALIDATION_ERROR, error: erros });
  }
  req.validatedBody = value;
  next();
};

export const createTodo = async (req: Request, res: Response) => {
  try {
    const { title, description } = req.validatedBody;
    logger.info({ title }, 'Creating TODO');
    const newTodo = new Todo({
      title: title,
      description: description,
    });
    const item = await newTodo.save();
    logger.info({ item: item._id }, 'Todo Created Successfully');
    return res.status(201).json(item);
  } catch (err: any) {
    logger.error({ err }, 'Error Creating Todo');
    if (err.code === 11000) {
      logger.warn({ title: req.validatedBody.title }, 'Duplicate title error');
      return res.status(500).json({ msg: ERROR_MESSAGES.TITLE_EXISTS });
    }
    res.status(500).json({ error: ERROR_MESSAGES.CREATE_FAILED });
  }
};

export const getAllTodos = async (_req: Request, res: Response) => {
  try {
    logger.info('Fetching all todos');
    const todos = await Todo.find();
    res.status(200).json(todos);
  } catch (err: any) {
    logger.error({ err }, 'Failed to fetch todos');
    res.status(500).json({ error: ERROR_MESSAGES.FETCH_FAILED });
  }
};

export const updateTodo = async (req: Request, res: Response) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    logger.warn({ id: req.params.id }, 'Invalid ID for update');
    return res.status(404).json({ error: ERROR_MESSAGES.INVALID_ID_FOND });
  }
  try {
    logger.info({ id: req.params.id }, 'Updating todo');
    const updated = await Todo.findByIdAndUpdate(req.params.id, req.validatedBody, { new: true });
    if (!updated) {
      logger.warn({ id: req.params.id }, 'Todo not found for update');
      return res.status(404).json({ error: ERROR_MESSAGES.TODO_NOT_FOUND });
    }
    logger.info({ id: req.params.id }, 'Todo updated successfully');
    res.status(200).json(updated);
  } catch (err: any) {
    logger.error({ err }, 'Error updating todo');
    res.status(500).json({ error: ERROR_MESSAGES.UPDATE_FAILED });
  }
};

export const deleteTodo = async (req: Request, res: Response) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    logger.warn({ id: req.params.id }, 'Invalid ID for delete');
    return res.status(404).json({ error: ERROR_MESSAGES.INVALID_ID_FOND });
  }
  try {
    logger.info({ id: req.params.id }, 'Deleting todo');
    const deleteRes = await Todo.findByIdAndDelete(req.params.id);
    if (!deleteRes) {
      logger.warn({ id: req.params.id }, 'Todo not found for delete');
      return res.status(404).json({ error: ERROR_MESSAGES.TODO_NOT_FOUND });
    }
    logger.info({ id: req.params.id }, 'Todo deleted successfully');
    res.status(204).send();
  } catch (err: any) {
    logger.error({ err }, 'Error deleting todo');
    res.status(500).json({ error: ERROR_MESSAGES.DELETE_FAILED });
  }
};
