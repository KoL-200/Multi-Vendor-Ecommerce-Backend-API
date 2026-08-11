const { getAllCategories, getCategoryById, createNewCategory, updateExistingCategory, deleteExistingCategory } = require('../services/categoryService')

const getCategories = async (req, res, next) => {
    const categories = await getAllCategories()
    res.status(200).json({ success: true, data: categories })
}

const getCategory = async (req, res, next) => {
    const { id } = req.params
    const category = await getCategoryById(id)
    res.status(200).json({ success: true, data: category })
}

const createCategory = async (req, res, next) => {
    const { name, description } = req.body
    const newCategory = await createNewCategory({ name, description })
    res.status(201).json({ success: true, data: newCategory })
}

const updateCategory = async (req, res) => {
    const { id } = req.params
    const { name, description } = req.body
    const updatedCategory = await updateExistingCategory(id, { name, description })
    res.status(200).json({ success: true, data: updatedCategory })
}

const deleteCategory = async (req, res, data) => {
    const { id } = req.params
    const deletedCategory = await deleteExistingCategory(id)
    res.status(200).json({ success: true, message: deletedCategory.message })
}

module.exports = {
    getCategories,
    getCategory,
    createCategory,
    updateCategory,
    deleteCategory
}