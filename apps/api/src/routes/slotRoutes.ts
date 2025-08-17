import Express from 'express';
import {
  createSlot,
  deleteSlot,
  getAllSlots,
  getSlotById,
  updateSlot,
  validateSlotCreate,
  validateSlotUpdate,
} from '../controllers/slotController';
import { requireAdmin } from '../middleware/requireAuth';
import { requireCaptcha } from '../middleware/requireCaptcha';

const router = Express.Router();

/**
 * @openapi
 * components:
 *   schemas:
 *     Slot:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: "64f93db24cbe6c3576f86041"
 *         name:
 *           type: string
 *           minLength: 2
 *           maxLength: 64
 *           example: "Jane Doe"
 *         email:
 *           type: string
 *           format: email
 *           example: "jane@example.com"
 *         date:
 *           type: string
 *           format: date-time
 *           example: "2025-08-10T10:30:00.000Z"
 *         duration:
 *           type: integer
 *           minimum: 15
 *           maximum: 120
 *           example: 30
 *         message:
 *           type: string
 *           maxLength: 500
 *           example: "Looking forward to our meeting!"
 *         status:
 *           type: string
 *           enum: [booked, cancelled]
 *           example: "booked"
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
 *                 example: "email"
 *               message:
 *                 type: string
 *                 example: "email is required"
 */

/**
 * @openapi
 * /api/slots:
 *   get:
 *     summary: List booked slots (filter/sort/paginate)
 *     description: >
 *       Supports react-admin style query params:
 *
 *       - **filter**: JSON string, e.g. `{"status":"booked","email":"jane@example.com"}`
 *       - **sort**: JSON tuple, e.g. `["date","ASC"]`
 *       - **range**: JSON pair `[start,end]` (0-based) for pagination.
 *       Response includes `X-Total-Count`.
 *     tags: [Slots]
 *     parameters:
 *       - in: query
 *         name: filter
 *         schema:
 *           type: string
 *         description: JSON string with fields like `status`, `email`, `date_gte`, `date_lte`
 *         example: '{"status":"booked","email":"jane@example.com"}'
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *         description: JSON array `[field, order]` where order is `ASC` or `DESC`
 *         example: '["date","DESC"]'
 *       - in: query
 *         name: range
 *         schema:
 *           type: string
 *         description: JSON array `[start,end]` for pagination (0-based)
 *         example: '[0, 9]'
 *     responses:
 *       200:
 *         description: List of slot bookings
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
 *                 $ref: '#/components/schemas/Slot'
 */
router.get('/', requireAdmin, getAllSlots);

/**
 * @openapi
 * /api/slots/{id}:
 *   get:
 *     summary: Get slot booking by ID
 *     tags: [Slots]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: Slot booking ID (MongoDB ObjectId)
 *     responses:
 *       200:
 *         description: Slot booking fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Slot'
 *       404:
 *         description: Slot booking not found
 */
router.get('/:id', requireAdmin, getSlotById);

/**
 * @openapi
 * /api/slots:
 *   post:
 *     summary: Create/book a new slot
 *     tags: [Slots]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, date]
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 64
 *               email:
 *                 type: string
 *                 format: email
 *               date:
 *                 type: string
 *                 format: date-time
 *               duration:
 *                 type: integer
 *                 minimum: 15
 *                 maximum: 120
 *                 default: 30
 *               message:
 *                 type: string
 *                 maxLength: 500
 *             example:
 *               name: "Jane Doe"
 *               email: "jane@example.com"
 *               date: "2025-08-19T15:00:00.000Z"
 *               duration: 45
 *               message: "Project discussion"
 *     responses:
 *       201:
 *         description: Slot booked successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Slot'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *       409:
 *         description: Slot conflict (already booked)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Slot not available."
 */
router.post('/', requireCaptcha, validateSlotCreate, createSlot);

/**
 * @openapi
 * /api/slots/{id}:
 *   put:
 *     summary: Update slot status or info
 *     tags: [Slots]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema: { type: string }
 *         required: true
 *         description: Slot booking ID (MongoDB ObjectId)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: "Fields to update"
 *             properties:
 *               date: { type: string, format: date-time }
 *               duration: { type: integer, minimum: 15, maximum: 120 }
 *               message: { type: string, maxLength: 500 }
 *               status: { type: string, enum: [booked, cancelled] }
 *           examples:
 *             cancel:
 *               value: { status: "cancelled" }
 *             reschedule:
 *               value: { date: "2025-08-19T16:30:00.000Z" }
 *     responses:
 *       200:
 *         description: Slot updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Slot'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *       404:
 *         description: Slot not found
 */
router.put('/:id', requireAdmin, validateSlotUpdate, updateSlot);

/**
 * @openapi
 * /api/slots/{id}:
 *   delete:
 *     summary: Delete/cancel a slot booking
 *     tags: [Slots]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema: { type: string }
 *         required: true
 *         description: Slot booking ID (MongoDB ObjectId)
 *     responses:
 *       204:
 *         description: Slot deleted (cancelled) successfully
 *       404:
 *         description: Slot not found
 */
router.delete('/:id', requireAdmin, deleteSlot);

export default router;
