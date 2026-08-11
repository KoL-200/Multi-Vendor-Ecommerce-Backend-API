const { z } = require('zod')

const createProductSchema = z.object(
    {
        name: z.string().min(1, "Name is required"),
        description: z.string().min(1, 'Description is required').optional(),
        price: z.number().min(0.01, "Indicate price"),
        stock: z.number().min(0, "Indicate stock"),
        sku: z.string().min(1, "Sku required"),
        categoryId: z.uuid()
    }
)

const updateProductSchema = z.object(
    {
        name: z.string().min(1, "Name is required").optional(),
        description: z.string().min(1, 'Description is required').optional(),
        price: z.number().min(1, "Indicate price").optional(),
        stock: z.number().min(0, "Indicate stock").optional(),
        sku: z.string().min(1, "Sku required").optional(),
        categoryId: z.uuid().optional(),
        isActive: z.boolean().optional()
    }
)

module.exports = {
    createProductSchema,
    updateProductSchema
}