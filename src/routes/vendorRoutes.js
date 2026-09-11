const express = require('express')
const routes = express.Router()

const authenticate = require('../middleware/authenticate')

const { apply } = require('../controllers/vendorController')

/**
 * @swagger
 * /vendor/apply:
 *   post:
 *     summary: Apply to become a vendor
 *     tags: [Vendors]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Application submitted
 *       401:
 *         description: Missing or invalid token
 */
routes.post('/apply', authenticate, apply)

module.exports = routes