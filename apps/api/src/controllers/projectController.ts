import mongoose from 'mongoose';
import { Request, Response } from 'express';
import Project from '../models/project';
import logger from '../utils/logger';
import { projectSchema, projectUpdateSchema } from '../validation/project';
import { PROJECT_ERROR_MESSAGES as ERROR_MESSAGES } from '../utils';
import { validateSchema } from '../validation';

export const validateProjectCreate = validateSchema(projectSchema);
export const validateProjectUpdate = validateSchema(projectUpdateSchema);

export const createProject = async (req: Request, res: Response) => {
  try {
    const project = new Project(req.validatedBody);
    const result = await project.save();
    const resultObj = result.toObject();
    resultObj.id = resultObj._id;
    delete resultObj._id;
    logger.info({ id: project._id }, '✅ Project created');
    res.status(201).json(resultObj);
  } catch (err) {
    logger.error({ err }, '❌ Project creation failed');
    res.status(500).json({ error: ERROR_MESSAGES.CREATE_FAILED });
  }
};

export const getAllProjects = async (req: Request, res: Response) => {
  try {
    const filter = req.query.filter ? JSON.parse(req.query.filter as string) : {};
    const range = req.query.range ? JSON.parse(req.query.range as string) : [0, 9];
    const sort = req.query.sort ? JSON.parse(req.query.sort as string) : ['createdAt', 'DESC'];

    const limit = range[1] - range[0] + 1;
    const skip = range[0];
    const total = await Project.countDocuments(filter);
    const sortField = sort[0];
    const sortOrder = sort[1] === 'DESC' ? -1 : 1;

    const items = await Project.find(filter)
      .sort({ [sortField]: sortOrder })
      .skip(skip)
      .limit(limit);

    const transformed = items.map((item) => {
      const obj = item.toObject();
      obj.id = obj._id;
      delete obj._id;
      return obj;
    });

    res.set('Access-Control-Expose-Headers', 'X-Total-Count, Content-Range');
    res.set('X-Total-Count', total.toString());
    res.set('Content-Range', `projects ${skip}-${skip + items.length - 1}/${total}`);

    res.status(200).json(transformed);
  } catch (err) {
    logger.error({ err }, '❌ Failed to fetch projects');
    res.status(500).json({ error: ERROR_MESSAGES.FETCH_FAILED });
  }
};

export const getProjectById = async (req: Request, res: Response) => {
  const id = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: ERROR_MESSAGES.INVALID_ID_FOND });
  }

  try {
    const found = await Project.findById(id);
    if (!found) {
      return res.status(404).json({ error: ERROR_MESSAGES.PROJECT_NOT_FOUND });
    }
    const obj = found.toObject();
    obj.id = obj._id;
    delete obj._id;
    res.status(200).json(obj);
  } catch (err) {
    logger.error({ err }, 'Failed to fetch project by ID');
    res.status(500).json({ error: ERROR_MESSAGES.FETCH_FAILED });
  }
};

export const updateProject = async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: 'Invalid ID supplied' });
  }

  try {
    delete req.body.createdAt;
    delete req.body.updatedAt;
    delete req.body.__v;
    delete req.body.id;

    req.validatedBody = req.body;

    const allowedFields = [
      'title',
      'description',
      'company',
      'role',
      'techStack',
      'features',
      'link',
      'year',
      'thumbnailUrl',
      'type',
    ];

    const filteredBody: Record<string, any> = {};
    for (const key of allowedFields) {
      if (req.validatedBody[key] !== undefined) {
        filteredBody[key] = req.validatedBody[key];
      }
    }

    const updated = await Project.findByIdAndUpdate(id, filteredBody, { new: true });

    if (!updated) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const result = updated.toObject();
    result.id = result._id;
    delete result._id;

    res.status(200).json(result);
  } catch (err) {
    logger.error({ err }, 'Failed to update project');
    res.status(500).json({ error: 'Update failed' });
  }
};

export const deleteProject = async (req: Request, res: Response) => {
  const id = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: ERROR_MESSAGES.INVALID_ID_FOND });
  }

  try {
    const deleted = await Project.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ error: ERROR_MESSAGES.PROJECT_NOT_FOUND });
    }
    res.status(204).send();
  } catch (err) {
    logger.error({ err }, 'Failed to delete project');
    res.status(500).json({ error: ERROR_MESSAGES.DELETE_FAILED });
  }
};
