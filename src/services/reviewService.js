const { findDeliveredPurchase, findReviewByUserAndProduct, findReviewsByProductId, findReviewById, updateReview, deleteReview, createReview } = require('../repositories/reviewRepository')
const { createRefreshToken } = require('../repositories/userRepository')

const { BadRequestError, ConflictError, NotFoundError, UnauthorizedError } = require('../utils/AppError')

const createNewReview = async (userId, productId, data) => {
    const delivered = await findDeliveredPurchase(userId, productId)

    if (!delivered) {
        throw new BadRequestError('You can only review products you have purchased and received')
    }

    const reviewExist = await findReviewByUserAndProduct(userId, productId)

    if (reviewExist) {
        throw new ConflictError('You have already reviewed this product')
    }

    return createReview(
        {
            userId,
            productId,
            rating: data.rating,
            comment: data.comment
        }
    )
}

const getProductReviews = async (productId) => {
    return findReviewsByProductId(productId)
}

const updateExistingReview = async (id, userId, data) => {
    const review = await findReviewById(id)

    if (!review || review.userId !== userId) {
        throw new NotFoundError('Review not found')
    }

    return updateReview(id, data)
}

const deleteExistingReview = async (id, userId, isAdmin) => {
    const review = await findReviewById(id)

    if (!review || (review.userId !== userId && !isAdmin)) {
        throw new NotFoundError('Review not found')
    }

    return deleteReview(id)
}

module.exports = {
    createNewReview,
    getProductReviews,
    updateExistingReview,
    deleteExistingReview
}