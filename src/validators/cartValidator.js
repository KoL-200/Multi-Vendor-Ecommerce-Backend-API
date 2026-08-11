const { z } = require('zod')

const addToCartSchema = zod.object(
    {
        "productId": z.uuid(),
        "quantity": z.int().min(1, "Quantity required")
    }
)

const updateCartItemSchema = zod.object(
    {
        "quantity": z.int().min(1, "Quantity required")

    }
)

module.exports = {
    addToCartSchema,
    updateCartItemSchema
}