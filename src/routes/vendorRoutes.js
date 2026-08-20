const express = require('express')
const routes = express.Router()

const authenticate = require('../middleware/authenticate')

const { apply } = require('../controllers/vendorController')

routes.post('/apply', authenticate, apply)

module.exports = routes