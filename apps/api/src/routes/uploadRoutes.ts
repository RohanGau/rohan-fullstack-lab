import Express from 'express';
import {
  deleteAsset,
  generateUploadUrl,
  validateDeleteAsset,
  validateGenerateUploadUrl,
} from '../controllers/uploadController';
import { requireAdmin } from '../middleware/requireAuth';

const router = Express.Router();

/**
 * @openapi
 * /api/uploads/generate-upload-url:
 *   post:
 *     summary: Generate a presigned upload URL for Cloudflare R2
 *     tags:
 *       - Uploads
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - filename
 *               - contentType
 *             properties:
 *               filename:
 *                 type: string
 *                 example: "user-avatar.png"
 *               contentType:
 *                 type: string
 *                 example: "image/png"
 *     responses:
 *       200:
 *         description: Successfully generated presigned URL
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 uploadUrl:
 *                   type: string
 *                   format: uri
 *                 cdnUrl:
 *                   type: string
 *                   format: uri
 *                 key:
 *                   type: string
 *                 expiresIn:
 *                   type: number
 *       400:
 *         description: Validation error
 *       500:
 *         description: Server error
 */
router.post('/generate-upload-url', requireAdmin, validateGenerateUploadUrl, generateUploadUrl);

/**
 * @openapi
 * /api/uploads:
 *   delete:
 *     summary: Delete an asset by key
 *     tags: [Uploads]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [key]
 *             properties:
 *               key:
 *                 type: string
 *                 example: "uploads/2025/08/08/example-avatar-b30e73ad.png"
 *     responses:
 *       204:
 *         description: Deleted
 *       404:
 *         description: Not found
 *       500:
 *         description: Server error
 */
router.delete('/', requireAdmin, validateDeleteAsset, deleteAsset);

export default router;
