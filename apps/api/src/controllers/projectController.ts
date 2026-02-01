import Project from '../models/project';
import { validateSchema } from '../validation';
import { projectSchema, projectUpdateSchema } from '../validation/project';
import { buildProjectQuery, normalizeBody } from '../utils';
import {
  makeListHandler,
  makeGetByIdHandler,
  makeCreateHandler,
  makeUpdateHandler,
  makeDeleteHandler,
} from '../lib/controller';

export const validateProjectCreate = validateSchema(projectSchema);
export const validateProjectUpdate = validateSchema(projectUpdateSchema);

const NS = 'projects';

export const getAllProjects = makeListHandler({
  ns: NS,
  model: Project,
  buildQuery: buildProjectQuery,
});

export const getProjectById = makeGetByIdHandler({
  ns: NS,
  model: Project,
});

export const createProject = makeCreateHandler({
  ns: NS,
  model: Project,
  normalize: normalizeBody,
  allowedFields: [],
});

export const updateProject = makeUpdateHandler({
  ns: NS,
  model: Project,
  normalize: normalizeBody,
  allowedFields: [
    'title',
    'description',
    'company',
    'role',
    'techStack',
    'features',
    'links',
    'year',
    'thumbnailUrl',
    'types',
    'isFeatured',
  ],
});

export const deleteProject = makeDeleteHandler({
  ns: NS,
  model: Project,
});
