const express = require('express');
const routes = express.Router();

const { checkout, myOrders, myOrder, updatedOrderStatus } = require('../controllers/orderContoller')

const authenticate = require('../middleware/authenticate');
const validate = require('../middleware/validate');

const { checkOutSchema } = require('../validators/orderValidator');

/**
 * @swagger
 * /orders:
 *   post:
 *     summary: Create a new order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [productId, quantity]
 *             properties:
 *               productId: { type: string, format: uuid }
 *               quantity: { type: integer, minimum: 1 }
 *     responses:
 *       201:
 *         description: Order created
 *       400:
 *         description: Validation error
 *       401:
 *         description: Missing or invalid token
 */
routes.post('/', authenticate, validate(checkOutSchema), checkout)

/**
 * @swagger
 * /orders:
 *   get:
 *     summary: Get the authenticated user's orders
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User orders
 *       401:
 *         description: Missing or invalid token
 */
routes.get('/', authenticate, myOrders)

/**
 * @swagger
 * /orders/{id}:
 *   get:
 *     summary: Get a specific order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Order details
 *       401:
 *         description: Missing or invalid token
 *       404:
 *         description: Order not found
 */
routes.get('/:id', authenticate, myOrder)

/**
 * @swagger
 * /orders/{id}/cancel:
 *   patch:
 *     summary: Cancel an order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Order cancelled
 *       401:
 *         description: Missing or invalid token
 *       404:
 *         description: Order not found
 */
routes.patch('/:id/cancel', authenticate, updatedOrderStatus)

module.exports = routes