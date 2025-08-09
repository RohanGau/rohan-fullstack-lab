import { validateSchema } from '../validation';
import { blogSchema, blogUpdateSchema } from '../validation/blog';
import Blog from '../models/Blog';
import { normalizeBlogBody } from '../utils/blog';
import { buildBlogQuery } from '../utils/blog';

import {
  makeListHandler, makeGetByIdHandler,
  makeCreateHandler, makeUpdateHandler, makeDeleteHandler
} from '../lib/controller';

export const validateBlogCreate = validateSchema(blogSchema);
export const validateBlogUpdate = validateSchema(blogUpdateSchema);

const NS = 'blogs';

export const getAllBlogs = makeListHandler({
  ns: NS,
  model: Blog,
  buildQuery: buildBlogQuery,
  allowedSort: ['createdAt','updatedAt','publishedAt','title'],
});

export const getBlogById = makeGetByIdHandler({
  ns: NS,
  model: Blog,
});

export const createBlog = makeCreateHandler({
  ns: NS,
  model: Blog,
  normalize: normalizeBlogBody,
  allowedFields: [], // not used in create
});

export const updateBlog = makeUpdateHandler({
  ns: NS,
  model: Blog,
  normalize: normalizeBlogBody,
  allowedFields: [
    'title','slug','content','summary','author',
    'tags','links','coverImageUrl','readingTime',
    'isFeatured','status','publishedAt',
  ],
});

export const deleteBlog = makeDeleteHandler({
  ns: NS,
  model: Blog,
});
