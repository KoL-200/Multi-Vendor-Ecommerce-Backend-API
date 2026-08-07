const { z } = require('zod')

const storeSchema = z.object(
    {
        name: z.string().min(1, 'Store name is required'),
        description: z.string().min(1, 'Description is required'),
        phone: z.string().min(1, 'Phone is required'),
        address: z.string().min(1, 'Address is required'),
    }
)

module.exports = {
    storeSchema
}