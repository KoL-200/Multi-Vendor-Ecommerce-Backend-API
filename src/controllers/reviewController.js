const { createNewReview, getProductReviews, updateExistingReview, deleteExistingReview } = require('../services/reviewService')

const newReview = async (req, res, next) => {
    const userId = req.user.userId
    const { id: productId } = req.params

    const review = await createNewReview(userId, productId, req.body)
    res.status(201).json({ success: true, data: review })
}

const productReviews = async (req, res, next) => {
    const { id: productId } = req.params

    const reviews = await getProductReviews(productId)
    res.status(200).json({ success: true, data: reviews })
}

const reviewUpdate = async (req, res, next) => {
    const { id } = req.params
    const userId = req.user.userId
    const { rating, comment } = req.body

    const updatedReview = await updateExistingReview(id, userId, { rating, comment })
    res.status(200).json({ success: true, data: updatedReview })
}

const reviewDelete = async (req, res, next) => {
    const { id } = req.params
    const { userId, isAdmin } = req.user

    const result = await deleteExistingReview(id, userId, isAdmin)
    res.status(200).json({ success: true, message: 'Review successfully deleted' })
}

module.exports = {
    newReview,
    productReviews,
    reviewUpdate,
    reviewDelete
}