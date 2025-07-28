import Express from 'express';
import {
  createBlog,
  deleteBlog,
  getAllBlogs,
  getBlogById,
  updateBlog,
  validateBlogUpdate,
  validateBlogCreate,
} from '../controllers/blogController';

const router = Express.Router();

/**
 * @openapi
 * /api/blogs:
 *   post:
 *     summary: Create a new blog post
 *     tags:
 *       - Blogs
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - content
 *               - author
 *             properties:
 *               title:
 *                 type: string
 *                 example: "10 Tips for Backend Engineers"
 *               content:
 *                 type: string
 *                 example: "In this guide, we'll explore tips for building scalable backends..."
 *               author:
 *                 type: string
 *                 example: "Rohan Kumar"
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["nodejs", "express", "mongoose"]
 *     responses:
 *       201:
 *         description: Blog created successfully
 *       400:
 *         description: Validation error
 */
router.post('/', validateBlogCreate, createBlog);

/**
 * @openapi
 * /api/blogs:
 *   get:
 *     summary: Get all blog posts
 *     tags:
 *       - Blogs
 *     responses:
 *       200:
 *         description: List of blog posts
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Blog'
 */
router.get('/', getAllBlogs);

/**
 * @openapi
 * /api/blogs/{id}:
 *   put:
 *     summary: Update a blog post
 *     tags:
 *       - Blogs
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the blog to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Updated Blog Title"
 *               content:
 *                 type: string
 *                 example: "Updated content goes here..."
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Blog updated successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Blog not found
 */
router.put('/:id', validateBlogUpdate, updateBlog);

/**
 * @openapi
 * /api/blogs/{id}:
 *   delete:
 *     summary: Delete a blog post
 *     tags:
 *       - Blogs
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the blog to delete
 *     responses:
 *       204:
 *         description: Blog deleted successfully
 *       404:
 *         description: Blog not found
 */
router.delete('/:id', deleteBlog);

/**
 * @openapi
 * /api/blogs/{id}:
 *   get:
 *     summary: Get blog post by ID
 *     tags:
 *       - Blogs
 *     parameters:
 *       - name: id
 *         in: path
 *         description: Blog post ID (MongoDB ObjectId)
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Blog fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Blog'
 *       404:
 *         description: Blog not found
 */
router.get('/:id', getBlogById);

export default router;
