const express = require('express')

const router = express.Router()

const authenticate = require('../middleware/authenticate');

const validate = require('../middleware/validate')

const { storeSchema } = require('../validators/storeValidator')

const { newStore } = require('../controllers/storeController')


router.post('/', authenticate, validate(storeSchema), newStore)

module.exports = router