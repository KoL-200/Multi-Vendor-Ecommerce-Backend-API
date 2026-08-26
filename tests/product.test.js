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
                .set('Authorization', `Bearer ${accessToken}`)
                .send(
                    {
                        name: 'Test Product',
                        description: 'This is a test product',
                        price: 29.99,
                        stock: 10,
                        sku: 'TEST-001',
                        categoryId
                    }
                )
                .expect(201)

            expect(response.body.data).toHaveProperty('id')
            expect(response.body.data.price).toBe(2999)
        })

        it('rejects creation with an invalid categoryId', async () => {
            const { accessToken } = await createApprovedVendorWithStore()

            const response = await request(app)
                .post('/api/v1/products')
                .set('Authorization', `Bearer ${accessToken}`)
                .send(
                    {
                        name: 'Test Product',
                        description: 'This is a test product',
                        price: 29.99,
                        stock: 10,
                        sku: 'TEST-001',
                        categoryId: '00000000-0000-0000-0000-000000000000'
                    }
                )
                .expect(400)

            expect(response.body).toHaveProperty('error')
        })

        it('rejects creation from a non-approved vendor', async () => {
            const userData = {
                email: 'carlos@gmail.com',
                name: 'Carlos',
                password: 'carlos123'
            }

            await request(app)
                .post('/api/v1/auth/register')
                .send(userData)
                .expect(201)

            const loginCredentials = {
                email: 'carlos@gmail.com',
                password: 'carlos123'
            }

            const loginResponse = await request(app)
                .post('/api/v1/auth/login')
                .send(loginCredentials)
                .expect(200)

            const { accessToken } = loginResponse.body.data
            const { categoryId } = await createAdminAndCategory()

            const response = await request(app)
                .post('/api/v1/products')
                .set('Authorization', `Bearer ${accessToken}`)
                .send(
                    {
                        name: 'Test Product',
                        description: 'This is a test product',
                        price: 29.99,
                        stock: 10,
                        sku: 'TEST-001',
                        categoryId
                    }
                )
                .expect(403)

            expect(response.body).toHaveProperty('error')
        })

    })
})