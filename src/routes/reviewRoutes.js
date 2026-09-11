const express = require('express')
const routes = express.Router()

const authenticate = require('../middleware/authenticate');
const validate = require('../middleware/validate');

const { updateReviewSchema } = require('../validators/reviewValidator')

const { reviewUpdate, reviewDelete } = require('../controllers/reviewController')


/**
 * @swagger
 * /reviews/{id}:
 *   patch:
 *     summary: Update a review (owner or admin only)
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Review ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *               comment:
 *                 type: string
 *     responses:
 *       200:
 *         description: Review updated
 *       403:
 *         description: Not the owner and not an admin
 *       404:
 *         description: Review not found
 *       401:
 *         description: Missing or invalid token
 */
routes.patch('/:id', authenticate, validate(updateReviewSchema), reviewUpdate)

/**
 * @swagger
 * /reviews/{id}:
 *   delete:
 *     summary: Delete a review (owner or admin only)
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Review ID
 *     responses:
 *       200:
 *         description: Review deleted
 *       403:
 *         description: Not the owner and not an admin
 *       404:
 *         description: Review not found
 *       401:
 *         description: Missing or invalid token
 */
routes.delete('/:id', authenticate, reviewDelete)

module.exports = routes