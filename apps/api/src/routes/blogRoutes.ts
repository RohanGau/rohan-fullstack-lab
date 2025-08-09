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
 * components:
 *   schemas:
 *     BlogLink:
 *       type: object
 *       properties:
 *         url:
 *           type: string
 *           format: uri
 *           example: "https://github.com/rohan/blog-repo"
 *         label:
 *           type: string
 *           maxLength: 80
 *           example: "Repository"
 *         kind:
 *           type: string
 *           enum: [repo, ref, demo, other]
 *           default: other
 *           example: "repo"
 *     Blog:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: "6897963de850da2e34e77c6a"
 *         title:
 *           type: string
 *           minLength: 3
 *           maxLength: 180
 *           example: "10 Tips for Backend Engineers"
 *         slug:
 *           type: string
 *           description: "Generated from title if not provided; unique, lowercased"
 *           example: "10-tips-for-backend-engineers"
 *         content:
 *           type: string
 *           minLength: 10
 *           example: "In this guide, we'll explore tips for building scalable backends..."
 *         summary:
 *           type: string
 *           maxLength: 500
 *           example: "Concise summary of the article"
 *         author:
 *           type: string
 *           example: "Rohan Kumar"
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *           example: ["nodejs", "express", "mongoose"]
 *         links:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/BlogLink'
 *         coverImageUrl:
 *           type: string
 *           format: uri
 *           example: "https://cdn.example.com/cover.jpg"
 *         readingTime:
 *           type: integer
 *           minimum: 1
 *           maximum: 120
 *           example: 8
 *         isFeatured:
 *           type: boolean
 *           default: false
 *           example: true
 *         status:
 *           type: string
 *           enum: [draft, published, archived]
 *           default: draft
 *           example: "published"
 *         publishedAt:
 *           type: string
 *           format: date-time
 *           description: "Auto-set when status becomes 'published' if not provided"
 *           example: "2025-08-09T18:38:00.000Z"
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     ValidationError:
 *       type: object
 *       properties:
 *         msg:
 *           type: string
 *           example: "Validation failed"
 *         error:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               field:
 *                 type: string
 *                 example: "title"
 *               message:
 *                 type: string
 *                 example: "title is required"
 */

/**
 * @openapi
 * /api/blogs:
 *   post:
 *     summary: Create a new blog post
 *     tags: [Blogs]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, content, author]
 *             properties:
 *               title:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 180
 *               slug:
 *                 type: string
 *                 pattern: "^[a-z0-9-]+$"
 *                 description: "Optional; generated from title if omitted"
 *               content:
 *                 type: string
 *                 minLength: 10
 *               summary:
 *                 type: string
 *                 maxLength: 500
 *               author:
 *                 type: string
 *               tags:
 *                 type: array
 *                 items: { type: string }
 *               links:
 *                 type: array
 *                 items: { $ref: '#/components/schemas/BlogLink' }
 *               coverImageUrl:
 *                 type: string
 *                 format: uri
 *               readingTime:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 120
 *               isFeatured:
 *                 type: boolean
 *                 default: false
 *               status:
 *                 type: string
 *                 enum: [draft, published, archived]
 *                 default: draft
 *               publishedAt:
 *                 type: string
 *                 format: date-time
 *                 description: "Optional; auto-set when status='published'"
 *           examples:
 *             default:
 *               value:
 *                 title: "10 Tips for Backend Engineers"
 *                 content: "In this guide..."
 *                 author: "Rohan Kumar"
 *                 tags: ["nodejs","express"]
 *                 links: [{ url: "https://github.com/rohan/repo", label: "Repo", kind: "repo" }]
 *                 isFeatured: true
 *                 status: "published"
 *     responses:
 *       201:
 *         description: Blog created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Blog'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 */
router.post('/', validateBlogCreate, createBlog);

/**
 * @openapi
 * /api/blogs:
 *   get:
 *     summary: List blog posts (filter/sort/paginate)
 *     description: >
 *       Supports react-admin style query params:
 *
 *       - **filter**: JSON string, e.g. `{"q":"text","slug":"my-slug","status":"published","isFeatured":true,"tags":["nodejs"]}`  
 *       - **sort**: JSON tuple, e.g. `["publishedAt","DESC"]` (allowed fields: createdAt, updatedAt, publishedAt, title)  
 *       - **range**: JSON pair `[start,end]` (0-based, inclusive) used for pagination. Response includes `X-Total-Count`.
 *
 *       To fetch by **slug**, use the list endpoint with filter:
 *       `GET /api/blogs?filter={"slug":"my-slug","status":"published"}&range=[0,0]`
 *     tags: [Blogs]
 *     parameters:
 *       - in: query
 *         name: filter
 *         schema:
 *           type: string
 *         description: JSON string with fields like `q`, `slug`, `status`, `isFeatured`, `tags`, `author`
 *         example: '{"status":"published","isFeatured":true,"tags":["nodejs"]}'
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *         description: JSON array `[field, order]` where order is `ASC` or `DESC`
 *         example: '["publishedAt","DESC"]'
 *       - in: query
 *         name: range
 *         schema:
 *           type: string
 *         description: JSON array `[start,end]` for pagination (0-based)
 *         example: '[0, 9]'
 *     responses:
 *       200:
 *         description: List of blog posts
 *         headers:
 *           X-Total-Count:
 *             description: Total number of items matching the filter
 *             schema:
 *               type: integer
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
 *     tags: [Blogs]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema: { type: string }
 *         required: true
 *         description: Blog ID (MongoDB ObjectId)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: "At least one field required"
 *             properties:
 *               title: { type: string, minLength: 3, maxLength: 180 }
 *               slug:
 *                 type: string
 *                 pattern: "^[a-z0-9-]+$"
 *               content: { type: string, minLength: 10 }
 *               summary: { type: string, maxLength: 500 }
 *               author: { type: string }
 *               tags:
 *                 type: array
 *                 items: { type: string }
 *               links:
 *                 type: array
 *                 items: { $ref: '#/components/schemas/BlogLink' }
 *               coverImageUrl: { type: string, format: uri }
 *               readingTime: { type: integer, minimum: 1, maximum: 120 }
 *               isFeatured: { type: boolean }
 *               status: { type: string, enum: [draft, published, archived] }
 *               publishedAt: { type: string, format: date-time }
 *           examples:
 *             default:
 *               value:
 *                 title: "Updated Blog Title"
 *                 status: "published"
 *                 readingTime: 7
 *     responses:
 *       200:
 *         description: Blog updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Blog'
 *       400:
 *         description: Validation error (unknown fields stripped; id/createdAt/updatedAt not allowed)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *       404:
 *         description: Blog not found
 */
router.put('/:id', validateBlogUpdate, updateBlog);

/**
 * @openapi
 * /api/blogs/{id}:
 *   delete:
 *     summary: Delete a blog post
 *     tags: [Blogs]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema: { type: string }
 *         required: true
 *         description: Blog ID (MongoDB ObjectId)
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
 *     tags: [Blogs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: Blog post ID (MongoDB ObjectId)
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
