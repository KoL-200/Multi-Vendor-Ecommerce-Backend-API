const { findAllCategory, findCategoryById, findCategoryByName, createCategory, updateCategory, deleteCategory } = require('../repositories/categoryRepository')

const { NotFoundError, ConflictError } = require('../utils/AppError')

const getAllCategories = async () => {
    return findAllCategory()
}

const getCategoryById = async (id) => {
    const category = await findCategoryById(id)

    if (!category) {
        throw new NotFoundError('Category not found')
    }

    return category
}

const createNewCategory = async ({ name, description }) => {
    const category = await findCategoryByName(name)

    if (category) {
        throw new ConflictError(`Category with name ${name} already exists`)
    }

    return createCategory(
        {
            name,
            description
        }
    )
}

const updateExistingCategory = async (id, data) => {
    const category = await findCategoryById(id)

    if (!category) {
        throw new NotFoundError('Category not found')
    }

    if (data.name) {
        const existing = await findCategoryByName(data.name)

        if (existing && !existing.id !== id) {
            throw new ConflictError(`Category with name ${data.name} already exist`)
        }
    }

    return updateCategory(id, data)
}

const deleteExistingCategory = async (id) => {
    const category = await findCategoryById(id)

    if (!category) {
        throw new NotFoundError('Category does not exist')
    }

    await deleteCategory(id)

    return {
        status: 200,
        message: "Category deleted successfully"
    }
}

module.exports = {
    getAllCategories,
    getCategoryById,
    createNewCategory,
    updateExistingCategory,
    deleteExistingCategory
}