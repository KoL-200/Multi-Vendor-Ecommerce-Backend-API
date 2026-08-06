const { z } = require('zod')

const registerSchema = z.object(
    {
        email: z.email({ pattern: z.regexes.rfc5322Email, message: 'Enter a valid email address' }),
        password: z.string().min(8, 'Enter a valid password'),
        name: z.string()
    }
)

const loginSchema = z.object(
    {
        email: z.email({ pattern: z.regexes.rfc5322Email, message: 'Enter a valid email address' }),
        password: z.string().min(8, 'Enter a valid password')
    }
)

module.exports = {
    registerSchema,
    loginSchema
}