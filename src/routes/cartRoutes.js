const express = require('express');
const routes = express.Router();

const authenticate = require('../middleware/authenticate');
const validate = require('../middleware/validate');

const { addToCartSchema, updateCartItemSchema } = require('../validators/cartValidator')

const { getItenFromCart, addToCart, updateItemFromCart, deleteItemFromCart } = require('../controllers/cartController');

/**
 * @swagger
 * /cart:
 *   get:
 *     summary: Get my cart items
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User cart items
 *       401:
 *         description: Missing or invalid token
 */
routes.get('/', authenticate, getItenFromCart)

/**
 * @swagger
 * /cart/items:
 *   post:
 *     summary: Add an item to the cart
 *     tags: [Cart]
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
 *       200:
 *         description: Item added to cart
 *       400:
 *         description: Validation error
 *       401:
 *         description: Missing or invalid token
 */
routes.post('/items', authenticate, validate(addToCartSchema), addToCart)

/**
 * @swagger
 * /cart/items/{id}:
 *   patch:
 *     summary: Update an item in the cart (owner or admin only)
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Cart item ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               quantity:
 *                 type: integer
 *                 minimum: 1
 *     responses:
 *       200:
 *         description: Cart item updated
 *       403:
 *         description: Not the owner and not an admin
 *       404:
 *         description: Cart item not found
 *       401:
 *         description: Missing or invalid token
 */
routes.patch('/items/:id', authenticate, validate(updateCartItemSchema), updateItemFromCart)

/**
 * @swagger
 * /cart/items/{id}:
 *   delete:
 *     summary: Delete an item from the cart (owner or admin only)
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Cart item ID
 *     responses:
 *       200:
 *         description: Cart item deleted
 *       403:
 *         description: Not the owner and not an admin
 *       404:
 *         description: Cart item not found
 *       401:
 *         description: Missing or invalid token
 */
routes.delete('/items/:id', authenticate, deleteItemFromCart)

module.exports = routes