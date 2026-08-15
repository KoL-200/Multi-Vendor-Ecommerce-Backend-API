const { z } = require('zod')

const checkOutSchema = z.object(
    {
        shippingName: z.string().min(1, "Shipping name is required"),
        shippingAddress: z.string().min(1, "Shipping address is required"),
        shippingCity: z.string().min(1, "Shipping city is required"),
        shippingPostalCode: z.string().min(1, "Postal code is required"),
        shippingPhone: z.string().min(1, 'Phone number is required')
    }
)

module.exports = {
    checkOutSchema
}