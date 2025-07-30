import express from 'express';
import {
  createContact,
  deleteContact,
  getContacts,
  validateContactCreate,
} from '../controllers/contactController';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Contact:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - message
 *       properties:
 *         id:
 *           type: string
 *           description: Auto-generated ID
 *         name:
 *           type: string
 *           description: Name of the sender
 *         email:
 *           type: string
 *           description: Email of the sender
 *         message:
 *           type: string
 *           description: Message content
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Auto-generated timestamp
 *       example:
 *         id: 6489fbd838ae83d3250abf9a
 *         name: Rohan Kumar
 *         email: rohan@example.com
 *         message: Let's collaborate to build something amazing.
 *         createdAt: 2025-07-30T10:15:48.000Z
 */

/**
 * @swagger
 * /api/contact:
 *   post:
 *     summary: Submit contact form data
 *     tags: [Contact]
 *     requestBody:
 *       description: Contact message content
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Contact'
 *     responses:
 *       201:
 *         description: Contact successfully submitted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *
 *                   $ref: '#/components/schemas/Contact'
 *       400:
 *         description: Validation error
 *       500:
 *         description: Server error
 */
router.post('/', validateContactCreate, createContact);

/**
 * @swagger
 * /api/contact:
 *   get:
 *     summary: Fetch list of contact messages (paginated)
 *     tags: [Contact]
 *     parameters:
 *       - in: query
 *         name: _start
 *         schema:
 *           type: integer
 *         description: Pagination start index
 *       - in: query
 *         name: _end
 *         schema:
 *           type: integer
 *         description: Pagination end index (used with _start)
 *       - in: query
 *         name: _sort
 *         schema:
 *           type: string
 *         description: Field name to sort by
 *       - in: query
 *         name: _order
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *         description: Sort order
 *     responses:
 *       200:
 *         description: Contact list response
 *         headers:
 *           X-Total-Count:
 *             schema:
 *               type: integer
 *             description: Total number of contact entries
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Contact'
 *       500:
 *         description: Server error
 */
router.get('/', getContacts);

/**
 * @swagger
 * /api/contact/{id}:
 *   delete:
 *     summary: Delete a contact message by ID
 *     tags: [Contact]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: MongoDB ObjectId of the message
 *     responses:
 *       204:
 *         description: Successfully deleted
 *       404:
 *         description: Contact not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', deleteContact);

export default router;
