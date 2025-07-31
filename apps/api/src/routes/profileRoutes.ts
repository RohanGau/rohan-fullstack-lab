import Express from 'express';
import {
  createProfile,
  deleteProfile,
  getAllProfiles,
  getProfileById,
  updateProfile,
  validateProfileCreate,
  validateProfileUpdate,
} from '../controllers/profileController';

const router = Express.Router();

/**
 * @openapi
 * components:
 *   schemas:
 *     Skill:
 *       type: object
 *       required:
 *         - name
 *         - rating
 *         - yearsOfExperience
 *       properties:
 *         name:
 *           type: string
 *         rating:
 *           type: number
 *           minimum: 1
 *           maximum: 10
 *         yearsOfExperience:
 *           type: number
 *           minimum: 0
 *
 *     ArchitectureArea:
 *       type: object
 *       required:
 *         - title
 *         - topics
 *       properties:
 *         title:
 *           type: string
 *         topics:
 *           type: array
 *           items:
 *             type: string
 *
 *     Profile:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         name:
 *           type: string
 *         email:
 *           type: string
 *         title:
 *           type: string
 *         bio:
 *           type: string
 *         avatarUrl:
 *           type: string
 *         yearsOfExperience:
 *           type: number
 *         skills:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Skill'
 *         githubUrl:
 *           type: string
 *         linkedinUrl:
 *           type: string
 *         location:
 *           type: string
 *         topSkills:
 *           type: array
 *           items:
 *             type: string
 *         allTechStack:
 *           type: array
 *           items:
 *             type: string
 *         architectureAreas:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ArchitectureArea'
 *         philosophy:
 *           type: string
 *         impact:
 *           type: array
 *           items:
 *             type: string
 *         createdAt:
 *           type: string
 *         updatedAt:
 *           type: string
 *
 *     ProfileInput:
 *       allOf:
 *         - $ref: '#/components/schemas/Profile'
 *         - type: object
 *           required:
 *             - name
 *             - email
 *             - title
 *             - yearsOfExperience
 *             - skills
 */

/**
 * @openapi
 * /api/profiles:
 *   post:
 *     summary: Create a new profile
 *     tags: [Profiles]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProfileInput'
 *     responses:
 *       201:
 *         description: Profile created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Profile'
 *       400:
 *         description: Validation error
 */
router.post('/', validateProfileCreate, createProfile);

/**
 * @openapi
 * /api/profiles:
 *   get:
 *     summary: Get all profiles
 *     tags: [Profiles]
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
 *         description: JSON filter (e.g. {"location":"India"})
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *         description: JSON sort (e.g. ["createdAt","DESC"])
 *     responses:
 *       200:
 *         description: List of profiles
 *         headers:
 *           X-Total-Count:
 *             schema:
 *               type: integer
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Profile'
 */
router.get('/', getAllProfiles);

/**
 * @openapi
 * /api/profiles/{id}:
 *   get:
 *     summary: Get profile by ID
 *     tags: [Profiles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: MongoDB ObjectId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Profile data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Profile'
 *       404:
 *         description: Profile not found
 */
router.get('/:id', getProfileById);

/**
 * @openapi
 * /api/profiles/{id}:
 *   put:
 *     summary: Update a profile
 *     tags: [Profiles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: MongoDB ObjectId
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProfileInput'
 *     responses:
 *       200:
 *         description: Updated profile
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Profile'
 *       404:
 *         description: Profile not found
 */
router.put('/:id', validateProfileUpdate, updateProfile);

/**
 * @openapi
 * /api/profiles/{id}:
 *   delete:
 *     summary: Delete a profile
 *     tags: [Profiles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId
 *     responses:
 *       204:
 *         description: Profile deleted
 *       404:
 *         description: Profile not found
 */
router.delete('/:id', deleteProfile);

export default router;
