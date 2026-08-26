const request = require('supertest')

const app = require('../src/app')

const { cleanDatabase, disconnectDatabase } = require('./setup')
const { createApprovedVendorWithStore, createAdminAndCategory } = require('./helper')

describe('Product endpoints', () => {
    beforeEach(async () => {
        await cleanDatabase()
    })

    afterAll(async () => {
        await disconnectDatabase()
    })

    describe('POST /api/v1/products', () => {
        it('create a product for an approved vendor with a valid category', async () => {
            const { accessToken } = await createApprovedVendorWithStore()
            const { categoryId } = await createAdminAndCategory()

            const response = await request(app)
                .post('/api/v1/products')
                .set('Authorisation', `Bearer ${accessToken}`)
                .send(
                    {
                        name: 'Test Product',
                        description: 'This is a test product',
                        price: 29.9,
                        stock: 10,
                        sku: 'TEST-001',
                        categoryId
                    }
                )
                .expect(201)

            expect(response.body.date).toHaveProperty('id')
            expect(response.body.data.price).toBe(2999)
        })
    })
})