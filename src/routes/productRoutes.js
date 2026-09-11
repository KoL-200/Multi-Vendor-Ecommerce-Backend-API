const express = require('express');
const routes = express.Router();

const authenticate = require('../middleware/authenticate');
const validate = require('../middleware/validate');

const { createProductSchema, updateProductSchema } = require('../validators/productValidator');
const { newProducts, getProduct, myProducts, updatedProduct, deletedProduct, productById } = require('../controllers/productController');
const { newReview, productReviews } = require('../controllers/reviewController');
const { createReviewSchema } = require('../validators/reviewValidator')

/**
 * @swagger
 * /products:
 *   post:
 *     summary: Create a product
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, price, stock, sku, categoryId]
 *             properties:
 *               name: { type: string }
 *               description: { type: string }
 *               price: { type: number, minimum: 0.01 }
 *               stock: { type: integer, minimum: 0 }
 *               sku: { type: string }
 *               categoryId: { type: string, format: uuid }
 *     responses:
 *       201:
 *         description: Product created
 *       400:
 *         description: Validation error
 *       401:
 *         description: Missing or invalid token
 */
routes.post('/', authenticate, validate(createProductSchema), newProducts);

/**
 * @swagger
 * /products/{id}/reviews:
 *   post:
 *     summary: Create a product review
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Product ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [rating, comment]
 *             properties:
 *               rating: { type: integer, minimum: 1, maximum: 5 }
 *               comment: { type: string }
 *     responses:
 *       201:
 *         description: Review created
 *       400:
 *         description: Validation error
 *       401:
 *         description: Missing or invalid token
 *       404:
 *         description: Product not found
 */
routes.post('/:id/reviews', authenticate, validate(createReviewSchema), newReview)

/**
 * @swagger
 * /products:
 *   get:
 *     summary: Get all products
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: categoryId
 *         schema:
 *           type: string
 *           format: uuid
 *         required: false
 *         description: Filter products by category
 *     responses:
 *       200:
 *         description: Product list
 */
routes.get('/', getProduct);

/**
 * @swagger
 * /products/my-products:
 *   get:
 *     summary: Get my products
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User products
 *       401:
 *         description: Missing or invalid token
 */
routes.get('/my-products', authenticate, myProducts);

/**
 * @swagger
 * /products/{id}:
 *   get:
 *     summary: Get a product by ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product details
 *       404:
 *         description: Product not found
 */
routes.get('/:id', productById);

/**
 * @swagger
 * /products/{id}/reviews:
 *   get:
 *     summary: Get product reviews
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product reviews
 *       404:
 *         description: Product not found
 */
routes.get('/:id/reviews', productReviews)

/**
 * @swagger
 * /products/{id}:
 *   patch:
 *     summary: Update a product (owner or admin only)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Product ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               description: { type: string }
 *               price: { type: number, minimum: 0.01 }
 *               stock: { type: integer, minimum: 0 }
 *               sku: { type: string }
 *               categoryId: { type: string, format: uuid }
 *               isActive: { type: boolean }
 *     responses:
 *       200:
 *         description: Product updated
 *       403:
 *         description: Not the owner and not an admin
 *       404:
 *         description: Product not found
 *       401:
 *         description: Missing or invalid token
 */
routes.patch('/:id', authenticate, validate(updateProductSchema), updatedProduct);

/**
 * @swagger
 * /products/{id}:
 *   delete:
 *     summary: Delete a product (owner or admin only)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product deleted
 *       403:
 *         description: Not the owner and not an admin
 *       404:
 *         description: Product not found
 *       401:
 *         description: Missing or invalid token
 */
routes.delete('/:id', authenticate, deletedProduct);

module.exports = routes;