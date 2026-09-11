const express = require('express')

const router = express.Router()

const authenticate = require('../middleware/authenticate');

const validate = require('../middleware/validate')

const { storeSchema, updateStoreSchema } = require('../validators/storeValidator')

const { newStore, getStores, getStore, updatedStore, deletedStore } = require('../controllers/storeController')

/**
 * @swagger
 * /stores:
 *   post:
 *     summary: Create a store
 *     tags: [Stores]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name: { type: string }
 *               description: { type: string }
 *               phone: { type: string }
 *               address: { type: string }
 *     responses:
 *       201:
 *         description: Store created
 *       400:
 *         description: Validation error
 *       401:
 *         description: Missing or invalid token
 */
router.post('/', authenticate, validate(storeSchema), newStore)

/**
 * @swagger
 * /stores:
 *   get:
 *     summary: Get all stores
 *     tags: [Stores]
 *     responses:
 *       200:
 *         description: Store list
 */
router.get('/', getStores)

/**
 * @swagger
 * /stores/{id}:
 *   get:
 *     summary: Get a store by ID
 *     tags: [Stores]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Store ID
 *     responses:
 *       200:
 *         description: Store details
 *       404:
 *         description: Store not found
 */
router.get('/:id', getStore)

/**
 * @swagger
 * /stores/{id}:
 *   patch:
 *     summary: Update a store (owner or admin only)
 *     tags: [Stores]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Store ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               description: { type: string }
 *               phone: { type: string }
 *               address: { type: string }
 *     responses:
 *       200:
 *         description: Store updated
 *       403:
 *         description: Not the owner and not an admin
 *       404:
 *         description: Store not found
 *       401:
 *         description: Missing or invalid token
 */
router.patch('/:id', authenticate, validate(updateStoreSchema), updatedStore)

/**
 * @swagger
 * /stores/{id}:
 *   delete:
 *     summary: Delete a store (owner or admin only)
 *     tags: [Stores]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Store ID
 *     responses:
 *       200:
 *         description: Store deleted
 *       403:
 *         description: Not the owner and not an admin
 *       404:
 *         description: Store not found
 *       401:
 *         description: Missing or invalid token
 */
router.delete('/:id', authenticate, deletedStore)

module.exports = router