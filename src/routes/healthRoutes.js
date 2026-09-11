const express = require('express');
const { prisma } = require('../config/database');

const router = express.Router();

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Check health of the application
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Application health status
 */
router.get('/health', async (req, res) => {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

module.exports = router;