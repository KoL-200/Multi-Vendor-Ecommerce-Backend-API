const express = require('express')
const routes = express.Router()

const authenticate = require('../middleware/authenticate');
const validate = require('../middleware/validate');

const { updateReviewSchema } = require('../validators/reviewValidator')

const { reviewUpdate, reviewDelete } = require('../controllers/reviewController')

routes.patch('/:id', authenticate, validate(updateReviewSchema), reviewUpdate)
routes.delete('/:id', authenticate, reviewDelete)

module.exports = routes