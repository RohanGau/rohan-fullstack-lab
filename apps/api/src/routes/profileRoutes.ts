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
 * /api/profiles:
 *   post:
 *     summary: Create a new profile
 *     tags:
 *       - Profiles
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - title
 *               - yearsOfExperience
 *               - skills
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Rohan Kumar"
 *               email:
 *                 type: string
 *                 example: "rohan@example.com"
 *               title:
 *                 type: string
 *                 example: "Backend Engineer"
 *               yearsOfExperience:
 *                 type: number
 *                 example: 5
 *               skills:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Node.js", "Express", "MongoDB"]
 *               bio:
 *                 type: string
 *                 example: "Passionate backend engineer..."
 *               avatarUrl:
 *                 type: string
 *                 example: "https://i.imgur.com/avatar.jpg"
 *               githubUrl:
 *                 type: string
 *                 example: "https://github.com/rohan"
 *               linkedinUrl:
 *                 type: string
 *                 example: "https://linkedin.com/in/rohan"
 *               location:
 *                 type: string
 *                 example: "Bangalore"
 *     responses:
 *       201:
 *         description: Profile created successfully
 *       400:
 *         description: Validation error
 */
router.post('/', validateProfileCreate, createProfile);

/**
 * @openapi
 * /api/profiles:
 *   get:
 *     summary: Get all profiles
 *     tags:
 *       - Profiles
 *     responses:
 *       200:
 *         description: List of profiles
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
 *   put:
 *     summary: Update a user profile
 *     tags:
 *       - Profiles
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the profile to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProfileInput'
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       404:
 *         description: Profile not found
 */
router.put('/:id', validateProfileUpdate, updateProfile);

/**
 * @openapi
 * /api/profiles/{id}:
 *   delete:
 *     summary: Delete a user profile
 *     tags:
 *       - Profiles
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: MongoDB ObjectId of the profile
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Profile deleted
 *       404:
 *         description: Profile not found
 */
router.delete('/:id', deleteProfile);

/**
 * @openapi
 * /api/profiles/{id}:
 *   get:
 *     summary: Get profile by ID
 *     tags:
 *       - Profiles
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID of the profile (MongoDB ObjectId)
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Profile fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Profile'
 *       404:
 *         description: Profile not found
 */
router.get('/:id', getProfileById);

export default router;
