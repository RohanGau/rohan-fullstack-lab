import Express from 'express';
import {
  createProject,
  getAllProjects,
  getProjectById,
  updateProject,
  deleteProject,
  validateProjectCreate,
  validateProjectUpdate,
} from '../controllers/projectController';
import { requireAdmin } from '../middleware/requireAuth';

const router = Express.Router();

/**
 * @openapi
 * tags:
 *   - name: Projects
 *     description: CRUD for portfolio projects
 *
 * components:
 *   schemas:
 *     ProjectLink:
 *       type: object
 *       properties:
 *         url:
 *           type: string
 *           format: uri
 *           example: "https://example.com"
 *         label:
 *           type: string
 *           example: "Live"
 *         kind:
 *           type: string
 *           enum: [live, repo, docs, demo, design, other]
 *           example: "live"
 *
 *     Project:
 *       type: object
 *       required: [title, description, techStack]
 *       properties:
 *         id:
 *           type: string
 *           description: Unique project ID
 *         title:
 *           type: string
 *           example: "PhonePe Account Aggregator Web App"
 *         description:
 *           type: string
 *           example: "An onboarding platform that enabled 50M+ users..."
 *         company:
 *           type: string
 *           example: "PhonePe"
 *         role:
 *           type: string
 *           example: "Frontend Lead"
 *         techStack:
 *           type: array
 *           items: { type: string }
 *           example: ["react", "node.js", "docker"]
 *         features:
 *           type: array
 *           items: { type: string }
 *           example: ["OAuth2", "Real-time updates"]
 *         links:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ProjectLink'
 *           example:
 *             - { url: "https://example.com", label: "Live", kind: "live" }
 *             - { url: "https://github.com/user/repo", label: "GitHub", kind: "repo" }
 *         year:
 *           type: integer
 *           example: 2024
 *         thumbnailUrl:
 *           type: string
 *           format: uri
 *           example: "https://cdn.example.com/thumbnails/app.png"
 *         types:
 *           type: array
 *           items:
 *             type: string
 *             enum: [web, mobile, api, cli, tool, library, backend, frontend, desktop]
 *           example: ["web", "backend"]
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 *     CreateProjectRequest:
 *       allOf:
 *         - $ref: '#/components/schemas/Project'
 *       required: [title, description, techStack]
 *       properties:
 *         id: { readOnly: true }
 *         createdAt: { readOnly: true }
 *         updatedAt: { readOnly: true }
 *
 *     UpdateProjectRequest:
 *       type: object
 *       description: Partial project fields to update
 *       properties:
 *         title:        { type: string }
 *         description:  { type: string }
 *         company:      { type: string }
 *         role:         { type: string }
 *         techStack:
 *           type: array
 *           items: { type: string }
 *         features:
 *           type: array
 *           items: { type: string }
 *         links:
 *           type: array
 *           items: { $ref: '#/components/schemas/ProjectLink' }
 *         year:         { type: integer }
 *         thumbnailUrl: { type: string, format: uri }
 *         types:
 *           type: array
 *           items:
 *             type: string
 *             enum: [web, mobile, api, cli, tool, library, backend, frontend, desktop]
 */

/**
 * @openapi
 * /api/projects:
 *   post:
 *     summary: Create a new project
 *     tags: [Projects]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateProjectRequest'
 *     responses:
 *       201:
 *         description: Project created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Project'
 *       400:
 *         description: Validation error
 */
router.post('/', requireAdmin, validateProjectCreate, createProject);

/**
 * @openapi
 * /api/projects:
 *   get:
 *     summary: Get all projects
 *     tags: [Projects]
 *     parameters:
 *       - in: query
 *         name: range
 *         schema:
 *           type: string
 *           example: "[0, 9]"
 *         description: JSON string like [start, end] for pagination
 *       - in: query
 *         name: filter
 *         schema:
 *           type: string
 *           example: "{\"types\": {\"$in\": [\"web\"]}}"
 *         description: JSON string filter (Mongo-like)
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           example: "[\"createdAt\",\"DESC\"]"
 *         description: JSON string like ["field","ASC" | "DESC"]
 *     responses:
 *       200:
 *         description: List of projects
 *         headers:
 *           X-Total-Count:
 *             schema:
 *               type: integer
 *             description: Total number of projects
 *           Content-Range:
 *             schema:
 *               type: string
 *             description: Range header for pagination (e.g., projects 0-9/42)
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Project'
 */
router.get('/', getAllProjects);

/**
 * @openapi
 * /api/projects/{id}:
 *   get:
 *     summary: Get project by ID
 *     tags: [Projects]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId for the project
 *     responses:
 *       200:
 *         description: Project data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Project'
 *       404:
 *         description: Project not found
 */
router.get('/:id', getProjectById);

/**
 * @openapi
 * /api/projects/{id}:
 *   put:
 *     summary: Update a project
 *     tags: [Projects]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId for the project
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateProjectRequest'
 *     responses:
 *       200:
 *         description: Updated project
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Project'
 *       404:
 *         description: Project not found
 */
router.put('/:id', requireAdmin, validateProjectUpdate, updateProject);

/**
 * @openapi
 * /api/projects/{id}:
 *   delete:
 *     summary: Delete a project
 *     tags: [Projects]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId for the project
 *     responses:
 *       204:
 *         description: Project deleted
 *       404:
 *         description: Project not found
 */
router.delete('/:id', requireAdmin, deleteProject);

export default router;
