const { z } = require('zod')

const createReviewSchema = z.object(
    {
        rating: z.int().min(1).max(5),
        comment: z.string().trim().optional()
    }
)

const updateReviewSchema = createReviewSchema.partial().refine(
    (data) => Object.keys(data).length > 0,
    { message: "At least one field (rating or comment) must be provided for an update" }
)

module.exports = {
    createReviewSchema,
    updateReviewSchema
}