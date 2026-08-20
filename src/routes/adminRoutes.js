const express = require('express');
const routes = express.Router();

const authenticate = require('../middleware/authenticate');
const { requireAdmin } = require('../middleware/requireAdmin');
const { overviewStats, revenueStats, bestProducts } = require('../controllers/adminController');
const { listPendingApplications, approve, reject, suspend } = require('../controllers/vendorController');

routes.get('/stats/overview', authenticate, requireAdmin, overviewStats);
routes.get('/stats/revenue', authenticate, requireAdmin, revenueStats)
routes.get('/stats/best-sellers', authenticate, requireAdmin, bestProducts)
routes.get('/vendor-applications', authenticate, requireAdmin, listPendingApplications)

routes.patch('/vendor-applications/:userId/approve', authenticate, requireAdmin, approve)
routes.patch('/vendor-applications/:userId/reject', authenticate, requireAdmin, reject)
routes.patch('/vendor-applications/:userId/suspend', authenticate, requireAdmin, suspend)

module.exports = routes;