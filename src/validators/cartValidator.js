const { z } = require('zod')

const addToCartSchema = z.object(
    {
        "productId": z.uuid(),
        "quantity": z.int().min(1, "Quantity required")
    }
)

const updateCartItemSchema = z.object(
    {
        "quantity": z.int().min(1, "Quantity required")

    }
)

module.exports = {
    addToCartSchema,
    updateCartItemSchema
}