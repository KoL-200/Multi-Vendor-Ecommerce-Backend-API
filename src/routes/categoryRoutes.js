const express = require('express')

const routes = express.Router()

const { getCategories, getCategory, createCategory, updateCategory, deleteCategory
} = require('../controllers/categoryController')

const { requireAdmin } = require('../middleware/requireAdmin')
const authenticate = require('../middleware/authenticate');

routes.get('/', getCategories)
routes.get('/:id', getCategory)
routes.post('/', authenticate, requireAdmin, createCategory)
routes.patch('/:id', authenticate, requireAdmin, updateCategory)
routes.delete('/:id', authenticate, requireAdmin, deleteCategory)

module.exports = routes