const express = require('express');
const routes = express.Router();

const { checkout, myOrders, myOrder, updatedOrderStatus } = require('../controllers/orderContoller')

const authenticate = require('../middleware/authenticate');
const validate = require('../middleware/validate');

const { checkOutSchema } = require('../validators/orderValidator');

routes.post('/', authenticate, validate(checkOutSchema), checkout)
routes.get('/', authenticate, myOrders)
routes.get('/:id', authenticate, myOrder)
routes.patch('/:id', authenticate, updatedOrderStatus)

module.exports = routes