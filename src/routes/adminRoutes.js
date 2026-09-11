const express = require('express');
const routes = express.Router();

const authenticate = require('../middleware/authenticate');
const { requireAdmin } = require('../middleware/requireAdmin');
const { overviewStats, revenueStats, bestProducts } = require('../controllers/adminController');
const { listPendingApplications, approve, reject, suspend } = require('../controllers/vendorController');

/**
 * @swagger
 * /admin/stats/overview:
 *   get:
 *     summary: Get overview admin statistics
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Overview stats
 *       401:
 *         description: Missing or invalid token
 *       403:
 *         description: Admin access required
 */

routes.get('/stats/overview', authenticate, requireAdmin, overviewStats);

/**
 * @swagger
 * /admin/stats/revenue:
 *   get:
 *     summary: Get revenue statistics
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Revenue stats
 *       401:
 *         description: Missing or invalid token
 *       403:
 *         description: Admin access required
 */
routes.get('/stats/revenue', authenticate, requireAdmin, revenueStats);

/**
 * @swagger
 * /admin/stats/best-sellers:
 *   get:
 *     summary: Get best selling products
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Number of top products to return
 *     responses:
 *       200:
 *         description: Best selling products
 *       401:
 *         description: Missing or invalid token
 *       403:
 *         description: Admin access required
 */
routes.get('/stats/best-sellers', authenticate, requireAdmin, bestProducts)

/**
 * @swagger
 * /admin/vendor-applications:
 *   get:
 *     summary: List all pending vendor applications
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Pending vendor applications
 *       401:
 *         description: Missing or invalid token
 *       403:
 *         description: Admin access required
 */
routes.get('/vendor-applications', authenticate, requireAdmin, listPendingApplications)

/**
 * @swagger
 * /admin/vendor-applications/{userId}/approve:
 *   patch:
 *     summary: Approve a vendor application
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: User ID
 *     responses:
 *       200:
 *         description: Vendor approved
 *       401:
 *         description: Missing or invalid token
 *       403:
 *         description: Admin access required
 *       404:
 *         description: User not found
 */
routes.patch('/vendor-applications/:userId/approve', authenticate, requireAdmin, approve)

/**
 * @swagger
 * /admin/vendor-applications/{userId}/reject:
 *   patch:
 *     summary: Reject a vendor application
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: User ID
 *     responses:
 *       200:
 *         description: Vendor application rejected
 *       401:
 *         description: Missing or invalid token
 *       403:
 *         description: Admin access required
 *       404:
 *         description: User not found
 */
routes.patch('/vendor-applications/:userId/reject', authenticate, requireAdmin, reject)

/**
 * @swagger
 * /admin/vendor-applications/{userId}/suspend:
 *   patch:
 *     summary: Suspend a vendor
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: User ID
 *     responses:
 *       200:
 *         description: Vendor suspended
 *       401:
 *         description: Missing or invalid token
 *       403:
 *         description: Admin access required
 *       404:
 *         description: User not found
 */
routes.patch('/vendor-applications/:userId/suspend', authenticate, requireAdmin, suspend)

module.exports = routes;