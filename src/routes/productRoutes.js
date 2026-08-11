const express = require('express');
const routes = express.Router();

const authenticate = require('../middleware/authenticate');
const validate = require('../middleware/validate');

const { createProductSchema, updateProductSchema } = require('../validators/productValidator');
const { newProducts, getProduct, myProducts, updatedProduct, deletedProduct, productById } = require('../controllers/productController');

routes.post('/', authenticate, validate(createProductSchema), newProducts);
routes.get('/', getProduct);
routes.get('/my-products', authenticate, myProducts);
routes.get('/:id', productById);
routes.patch('/:id', authenticate, validate(updateProductSchema), updatedProduct);
routes.delete('/:id', authenticate, deletedProduct);

module.exports = routes;