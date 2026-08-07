const express = require('express');
const healthRoutes = require('./healthRoutes');

const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const storeRoutes = require('./storeRoutes')

const router = express.Router();

router.use('/', healthRoutes);
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/stores', storeRoutes)

module.exports = router;