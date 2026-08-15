const express = require('express');
const healthRoutes = require('./healthRoutes');

const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const storeRoutes = require('./storeRoutes')
const categoryRoutes = require('./categoryRoutes')
const productRoutes = require('./productRoutes')
const cartRoutes = require('./cartRoutes')
const orderRoutes = require('./orderRoutes')
const reviewRoutes = require('./reviewRoutes')

const router = express.Router();

router.use('/', healthRoutes);
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/stores', storeRoutes)
router.use('/categories', categoryRoutes)
router.use('/products', productRoutes)
router.use('/carts', cartRoutes)
router.use('/orders', orderRoutes)
router.use('/reviews', reviewRoutes)

module.exports = router;