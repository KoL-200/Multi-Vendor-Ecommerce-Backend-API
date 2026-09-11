const swaggerJsodoc = require('swagger-jsdoc')

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Multi-Vendor E-Commerce Backend API',
            version: '1.0.0',
            description: 'API documentation for the multi-vendor marketplace backend',
        },
        servers: [
            {
                url: '/api/v1'
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT'
                },
            },
        },
    },
    apis: [
        './src/routes/*.js'
    ]
}

module.exports = swaggerJsodoc(options)