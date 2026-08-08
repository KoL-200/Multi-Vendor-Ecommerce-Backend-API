const express = require('express')

const router = express.Router()

const authenticate = require('../middleware/authenticate');

const validate = require('../middleware/validate')

const { storeSchema, updateStoreSchema } = require('../validators/storeValidator')

const { newStore, getStores, getStore, updatedStore, deletedStore } = require('../controllers/storeController')


router.post('/', authenticate, validate(storeSchema), newStore)
router.get('/', getStores)
router.get('/:id', getStore)
router.patch('/:id', authenticate, validate(updateStoreSchema), updatedStore)
router.delete('/:id', authenticate, deletedStore)

module.exports = router