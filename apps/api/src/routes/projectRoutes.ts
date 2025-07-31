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

const router = Express.Router();

/**
 * @openapi
 * components:
 *   schemas:
 *     Project:
 *       type: object
 *       required:
 *         - title
 *         - description
 *         - techStack
 *       properties:
 *         id:
 *           type: string
 *           description: Unique project ID
 *         title:
 *           type: string
 *           example: PhonePe Account Aggregator Web App
 *         description:
 *           type: string
 *           example: "An onboarding platform that enabled 50M+ users to aggregate their financial accounts in real time."
 *         company:
 *           type: string
 *           example: PhonePe
 *         role:
 *           type: string
 *           example: Frontend Lead
 *         techStack:
 *           type: array
 *           items:
 *             type: string
 *           example: ["React", "Node.js", "Redux", "Docker"]
 *         features:
 *           type: array
 *           items:
 *             type: string
 *           example: ["Seamless onboarding", "OAuth2", "Real-time updates"]
 *         link:
 *           type: string
 *           format: uri
 *           example: "https://yourproject.com"
 *         year:
 *           type: integer
 *           example: 2024
 *         thumbnailUrl:
 *           type: string
 *           example: "/projects/phonepe-aa.png"
 *         type:
 *           type: string
 *           enum: [web, mobile, api, cli, tool, library]
 *           example: web
 *         createdAt:
 *           type: string
 *         updatedAt:
 *           type: string
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
 *             $ref: '#/components/schemas/Project'
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
router.post('/', validateProjectCreate, createProject);

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
 *         description: JSON string like [0, 9] for pagination
 *       - in: query
 *         name: filter
 *         schema:
 *           type: string
 *         description: JSON filter object
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *         description: Sort order, e.g. ["createdAt","DESC"]
 *     responses:
 *       200:
 *         description: List of projects
 *         headers:
 *           X-Total-Count:
 *             schema:
 *               type: integer
 *             description: Total number of projects
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
 *             $ref: '#/components/schemas/Project'
 *     responses:
 *       200:
 *         description: Updated project details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Project'
 *       404:
 *         description: Project not found
 */
router.put('/:id', validateProjectUpdate, updateProject);

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
router.delete('/:id', deleteProject);

export default router;
