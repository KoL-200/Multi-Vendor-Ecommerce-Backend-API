const { prisma } = require('../config/database');

function findAllCategory() {
    return prisma.category.findMany()
}

function findCategoryById(id) {
    return prisma.category.findUnique(
        {
            where: {
                id: id
            }
        }
    )
}

function findCategoryByName(name) {
    return prisma.category.findUnique(
        {
            where: {
                name: name
            }
        }
    )
}

function createCategory({ name, description }) {
    return prisma.category.create(
        {
            data: {
                name,
                description
            }
        }
    )
}

function updateCategory(id, data) {
    return prisma.category.update(
        {
            where: {
                id: id,
            },
            data
        }
    )
}

function deleteCategory(id) {
    return prisma.category.delete(
        {
            where: { id }
        }
    )
}

module.exports = {
    findAllCategory,
    findCategoryById,
    findCategoryByName,
    createCategory,
    updateCategory,
    deleteCategory
}