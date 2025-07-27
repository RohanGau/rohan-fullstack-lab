import Express from 'express';
import {
  createTodo,
  validateTodoCreation,
  getAllTodos,
  updateTodo,
  deleteTodo,
} from '../controllers/todoControllers';

const router = Express.Router();

/**
 * @openapi
 * /api/todos:
 *   post:
 *     summary: Create a new todo
 *     tags:
 *       - Todos
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: Buy milk
 *               description:
 *                 type: string
 *                 example: 2 liters from the store
 *     responses:
 *       201:
 *         description: Successfully created
 *       400:
 *         description: Validation error
 *   get:
 *     summary: Get all todos
 *     tags:
 *       - Todos
 *     responses:
 *       200:
 *         description: List of todos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Todo'
 *       500:
 *         description: Failed to fetch todos
 */
router.post('/', validateTodoCreation, createTodo);
router.get('/', getAllTodos);
/**
 * @openapi
 * /api/todos/{id}:
 *   put:
 *     summary: Update a todo
 *     tags:
 *       - Todos
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Todo ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successfully updated
 *       404:
 *         description: Todo not found
 *       400:
 *         description: Validation error
 *   delete:
 *     summary: Delete a todo
 *     tags:
 *       - Todos
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Todo ID
 *     responses:
 *       204:
 *         description: Successfully deleted
 *       404:
 *         description: Todo not found
 */
router.put('/:id', validateTodoCreation, updateTodo);
router.delete('/:id', deleteTodo);

export default router;
