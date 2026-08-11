const express = require('express');
const routes = express.Router();

const authenticate = require('../middleware/authenticate');
const validate = require('../middleware/validate');

const { addToCartSchema, updateCartItemSchema } = require('../validators/cartValidator')

const { getItenFromCart, addToCart, updateItemFromCart, deleteItemFromCart } = require('../controllers/cartController');

routes.get('/', authenticate, getItenFromCart)
routes.post('/items', authenticate, validate(addToCartSchema), addItemToCart)
routes.patch('/items/:id', authenticate, validate(updateCartItemSchema), updateItemFromCart)
routes.delete('/items/:id', authenticate, deleteItemFromCart)

module.exports = routes