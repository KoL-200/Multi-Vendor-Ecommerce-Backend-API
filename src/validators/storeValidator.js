const { z } = require('zod')

const storeSchema = z.object(
    {
        name: z.string().min(1, 'Store name is required'),
        description: z.string().min(1, 'Description is required').optional(),
        phone: z.string().min(1, 'Phone is required').optional(),
        address: z.string().min(1, 'Address is required').optional(),
    }
)

const updateStoreSchema = z.object(
    {
        name: z.string().min(1).optional(),
        description: z.string().min(1).optional(),
        phone: z.string().min(1).optional(),
        address: z.string().min(1).optional(),
    }
)

module.exports = {
    storeSchema,
    updateStoreSchema
}