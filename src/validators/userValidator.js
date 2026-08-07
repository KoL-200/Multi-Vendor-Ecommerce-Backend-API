const { z } = require('zod')

const updateProfileSchema = z.object(
    {
        name: z.string().min(1, 'Name is required'),
    }
)

module.exports = {
    updateProfileSchema
}