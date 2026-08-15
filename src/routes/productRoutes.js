const express = require('express');
const routes = express.Router();

const authenticate = require('../middleware/authenticate');
const validate = require('../middleware/validate');

const { createProductSchema, updateProductSchema } = require('../validators/productValidator');
const { newProducts, getProduct, myProducts, updatedProduct, deletedProduct, productById } = require('../controllers/productController');
const { newReview, productReviews } = require('../controllers/reviewController');
const { createReviewSchema } = require('../validators/reviewValidator')

routes.post('/', authenticate, validate(createProductSchema), newProducts);
routes.post('/:id/reviews', authenticate, validate(createReviewSchema), newReview)

routes.get('/', getProduct);
routes.get('/my-products', authenticate, myProducts);
routes.get('/:id', productById);
routes.get('/:id/reviews', productReviews)

routes.patch('/:id', authenticate, validate(updateProductSchema), updatedProduct);
routes.delete('/:id', authenticate, deletedProduct);

module.exports = routes;