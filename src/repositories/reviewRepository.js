const { prisma } = require('../config/database')

function findDeliveredPurchase(userId, productId) {
    return prisma.order.findFirst({
        where: {
            customerId: userId,
            status: 'DELIVERED',
            items: {
                some: {
                    productId
                }
            }
        }
    })
}

function findReviewByUserAndProduct(userId, productId) {
    return prisma.review.findUnique(
        {
            where: {
                userId_productId: {
                    userId: userId,
                    productId: productId
                }
            }
        }
    )
}

function createReview({ userId, productId, rating, comment }) {
    return prisma.review.create(
        {
            data: {
                userId,
                productId,
                rating,
                comment
            }
        }
    )
}

function findReviewById(id) {
    return prisma.review.findUnique(
        {
            where: {
                id
            }
        }
    )
}

function findReviewsByProductId(productId) {
    return prisma.review.findMany(
        {
            where: {
                productId
            }
        }
    )
}

function updateReview(id, data) {
    return prisma.review.update(
        {
            where: {
                id
            },
            data
        }
    )
}

function deleteReview(id) {
    return prisma.review.delete(
        {
            where: {
                id
            }
        }
    )
}

module.exports = {
    findDeliveredPurchase,
    findReviewByUserAndProduct,
    createReview,
    findReviewById,
    findReviewsByProductId,
    updateReview,
    deleteReview
}