const { prisma } = require('../config/database');

function createProduct({ storeId, name, description, price, stock, sku, categoryId }) {
    return prisma.product.create(
        {
            data: {
                storeId,
                name,
                description,
                price,
                stock,
                sku,
                categoryId
            }
        }
    )
}

function findProductById(id) {
    return prisma.product.findUnique(
        {
            where: {
                id: id
            }
        }
    )
}

function findProductByStoreId(storeId) {
    return prisma.product.findMany(
        {
            where: {
                storeId
            }
        }
    )
}

function findProducts({ where, orderBy, skip, take }) {
    return prisma.product.findMany(
        {
            where,
            orderBy,
            skip,
            take
        }
    )
}

function countProducts(where) {
    return prisma.product.count(
        {
            where
        }
    )
}

function updateProduct(id, data) {
    return prisma.product.update(
        {
            where: {
                id: id
            },
            data
        }
    )
}

function deleteProduct(id) {
    return prisma.product.delete(
        {
            where: {
                id: id
            }
        }
    )
}

function findProductsByIds(ids) {
    return prisma.product.findMany(
        {
            where: {
                id: {
                    in: ids
                }
            },
            select: {
                id: true,
                name: true,
                price: true
            }
        }
    )
}

module.exports = {
    createProduct,
    findProductById,
    findProductByStoreId,
    findProducts,
    countProducts,
    updateProduct,
    deleteProduct,
    findProductsByIds
}