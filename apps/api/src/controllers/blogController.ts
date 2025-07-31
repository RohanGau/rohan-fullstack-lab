import mongoose from 'mongoose';
import { Request, Response } from 'express';
import Blog from '../models/Blog';
import logger from '../utils/logger';
import { blogSchema, blogUpdateSchema } from '../validation/blog';
import { CMS_ERROR_MESSAGES as ERROR_MESSAGES } from '../utils';
import { validateSchema } from '../validation';

// Usage
export const validateBlogCreate = validateSchema(blogSchema);
export const validateBlogUpdate = validateSchema(blogUpdateSchema);

export const createBlog = async (req: Request, res: Response) => {
  try {
    const blog = new Blog(req.validatedBody);
    const result = await blog.save();
    const resultObj = result.toObject();
    resultObj.id = resultObj._id;
    delete resultObj._id;
    res.status(201).json({ data: resultObj });
  } catch (err: any) {
    logger.error({ err }, 'Blog creation failed');
    res.status(500).json({ error: ERROR_MESSAGES.CREATE_FAILED });
  }
};

export const getAllBlogs = async (req: Request, res: Response) => {
  try {
    // React-Admin query params
    const filter = req.query.filter ? JSON.parse(req.query.filter as string) : {};
    const range = req.query.range ? JSON.parse(req.query.range as string) : [0, 9];
    const sort = req.query.sort ? JSON.parse(req.query.sort as string) : ['createdAt', 'DESC'];

    // Calculate pagination
    const skip = range[0];
    const limit = range[1] - range[0] + 1;
    const sortField = sort[0];
    const sortOrder = sort[1] === 'DESC' ? -1 : 1;

    const total = await Blog.countDocuments(filter);
    const blogs = await Blog.find(filter)
      .sort({ [sortField]: sortOrder })
      .skip(skip)
      .limit(limit);

    const transformed = blogs.map((blog) => {
      const blogObj = blog.toObject();
      blogObj.id = blogObj._id;
      delete blogObj._id;
      return blogObj;
    });

    res.set('Access-Control-Expose-Headers', 'X-Total-Count, Content-Range');
    res.set('X-Total-Count', total.toString());
    res.set('Content-Range', `blogs ${skip}-${skip + blogs.length - 1}/${total}`);

    res.status(200).json(transformed);
  } catch (err: any) {
    logger.error({ err }, 'Failed to fetch blogs');
    res.status(500).json({ error: 'Failed to fetch blogs' });
  }
};

export const updateBlog = async (req: Request, res: Response) => {
  const id = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: ERROR_MESSAGES.INVALID_ID_FOND });
  }

  try {
    const allowedFields = ['title', 'content', 'author', 'tags'];
    const filteredBody: Record<string, any> = {};

    for (const key of allowedFields) {
      if (req.validatedBody[key] !== undefined) {
        filteredBody[key] = req.validatedBody[key];
      }
    }

    const updated = await Blog.findByIdAndUpdate(id, filteredBody, { new: true });

    if (!updated) {
      logger.warn({ id }, 'Blog not found');
      return res.status(404).json({ error: ERROR_MESSAGES.BLOG_NOT_FOUND });
    }

    const updatedObj = updated.toObject();
    updatedObj.id = updatedObj._id;
    delete updatedObj._id;

    res.status(200).json(updatedObj);
  } catch (err: any) {
    logger.error({ err }, 'Failed to update blog');
    res.status(500).json({ error: ERROR_MESSAGES.UPDATE_FAILED });
  }
};

export const deleteBlog = async (req: Request, res: Response) => {
  const id = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: ERROR_MESSAGES.INVALID_ID_FOND });
  }

  try {
    const deleted = await Blog.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ error: ERROR_MESSAGES.BLOG_NOT_FOUND });
    }
    res.status(204).send();
  } catch (err: any) {
    logger.error({ err }, 'Failed to delete blog');
    res.status(500).json({ error: ERROR_MESSAGES.DELETE_FAILED });
  }
};

export const getBlogById = async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: ERROR_MESSAGES.INVALID_ID_FOND });
  }

  try {
    const found = await Blog.findById(id);
    if (!found) {
      return res.status(404).json({ error: ERROR_MESSAGES.BLOG_NOT_FOUND });
    }
    const blogObj = found.toObject();
    blogObj.id = blogObj._id;
    delete blogObj._id;
    res.status(200).json(blogObj);
  } catch (err: any) {
    logger.error({ err }, 'Failed to fetch blog by id');
    res.status(500).json({ error: ERROR_MESSAGES.FETCH_FAILED });
  }
};
