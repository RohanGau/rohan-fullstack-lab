import mongoose from 'mongoose';
import { Request, Response } from 'express';
import Project from '../models/project';
import logger from '../utils/logger';
import { projectSchema, projectUpdateSchema } from '../validation/project';
import { normalizeBody, safeJsonParse } from '../utils';
import { PROJECT_ERROR_MESSAGES as ERROR_MESSAGES } from '../utils';
import { validateSchema } from '../validation';

export const validateProjectCreate = validateSchema(projectSchema);
export const validateProjectUpdate = validateSchema(projectUpdateSchema);

export const createProject = async (req: Request, res: Response) => {
  try {
    const normalized = normalizeBody(req.validatedBody);
    const project = new Project(normalized);
    const result = await project.save();
    const obj = result.toJSON();
    res.status(201).json(obj);
  } catch (err) {
    logger.error({ err }, '❌ Project creation failed');
    res.status(500).json({ error: ERROR_MESSAGES.CREATE_FAILED });
  }
};

export const getAllProjects = async (req: Request, res: Response) => {
  try {
    const filter = safeJsonParse<Record<string, any>>(req.query.filter, {});
    const range = safeJsonParse<[number, number]>(req.query.range, [0, 9]);
    const sort = safeJsonParse<[string, 'ASC' | 'DESC']>(req.query.sort, ['createdAt', 'DESC']);

    const limit = Math.max(0, range[1] - range[0] + 1);
    const skip = Math.max(0, range[0]);

    const allowedSort = new Set(['createdAt', 'updatedAt', 'year', 'title']);
    const sortField = allowedSort.has(sort[0]) ? sort[0] : 'createdAt';
    const sortOrder = sort[1] === 'DESC' ? -1 : 1;

    const total = await Project.countDocuments(filter);

    const items = await Project.find(filter)
      .sort({ [sortField]: sortOrder })
      .skip(skip)
      .limit(limit)
      .lean({ virtuals: true });

    const transformed = items.map((doc: any) => {
      const id = String(doc.id ?? doc._id);
      const { _id, __v, ...rest } = doc;
      return { id, ...rest };
    });

    const end = transformed.length ? skip + transformed.length - 1 : skip;

    res.set('Access-Control-Expose-Headers', 'X-Total-Count, Content-Range');
    res.set('X-Total-Count', total.toString());
    res.set('Content-Range', `projects ${skip}-${end}/${total}`);

    res.status(200).json(transformed);
  } catch (err) {
    logger.error({ err }, '❌ Failed to fetch projects');
    res.status(500).json({ error: ERROR_MESSAGES.FETCH_FAILED });
  }
};

export const getProjectById = async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: ERROR_MESSAGES.INVALID_ID_FOND });
  }
  try {
    const found = await Project.findById(id);
    if (!found) {
      return res.status(404).json({ error: ERROR_MESSAGES.PROJECT_NOT_FOUND });
    }
    const obj = found.toJSON();
    res.status(200).json(obj);
  } catch (err) {
    logger.error({ err }, 'Failed to fetch project by ID');
    res.status(500).json({ error: ERROR_MESSAGES.FETCH_FAILED });
  }
};

/**
 * Update a project
 */
export const updateProject = async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: ERROR_MESSAGES.INVALID_ID_FOND });
  }

  try {
    delete (req.body ?? {}).createdAt;
    delete (req.body ?? {}).updatedAt;
    delete (req.body ?? {}).__v;
    delete (req.body ?? {}).id;
    req.validatedBody = req.validatedBody ?? req.body;
    const normalized = normalizeBody(req.validatedBody);
    const allowed = [
      'title', 'description', 'company', 'role',
      'techStack', 'features', 'links', 'year', 'thumbnailUrl', 'types',
    ];
    const update: Record<string, any> = {};
    for (const k of allowed) {
      if (normalized[k] !== undefined) update[k] = normalized[k];
    }

    const updated = await Project.findByIdAndUpdate(
      id,
      { $set: update },
      { new: true, runValidators: true, strict: 'throw' }
    );
    if (!updated) {
      return res.status(404).json({ error: ERROR_MESSAGES.PROJECT_NOT_FOUND });
    }

    res.status(200).json(updated.toJSON());
  } catch (err) {
    logger.error({ err }, 'Failed to update project');
    res.status(500).json({ error: ERROR_MESSAGES.UPDATE_FAILED });
  }
};

/**
 * Delete a project
 */
export const deleteProject = async (req: Request, res: Response) => {
  const { id } = req.params;
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
