const express = require('express');
const { prisma } = require('../config/database');

const router = express.Router();

router.get('/health', async (req, res) => {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

module.exports = router;