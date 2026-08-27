const request = require('supertest')

const app = require('../src/app')

const { cleanDatabase, disconnectDatabase } = require('./setup')
const { createApprovedVendorWithStore, createAdminAndCategory } = require('./helpers')
const expectCookies = require('supertest/lib/cookies')

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

    describe('GET /api/v1/products', () => {
        let categoryId, accessToken

        beforeEach(async () => {
            await cleanDatabase()

            const vendor = await createApprovedVendorWithStore()
            accessToken = vendor.accessToken

            const category = await createAdminAndCategory()
            categoryId = category.categoryId

            await request(app)
                .post('/api/v1/products')
                .set(
                    'Authorization', `Bearer ${accessToken}`
                )
                .send(
                    {
                        name: 'White Sneakers',
                        description: 'Footwares',
                        price: 30.99,
                        stock: 12,
                        sku: 'SKU-01',
                        categoryId
                    },
                )

            await request(app)
                .post('/api/v1/products')
                .set(
                    'Authorization', `Bearer ${accessToken}`
                )
                .send(
                    {
                        name: 'Hp',
                        description: 'Laptop',
                        price: 357.99,
                        stock: 5,
                        sku: 'SKU-02',
                        categoryId
                    }
                )

            await request(app)
                .post('/api/v1/products')
                .set(
                    'Authorization', `Bearer ${accessToken}`
                )
                .send(
                    {
                        name: 'Grey Sneakers',
                        description: 'Footwares',
                        price: 25.99,
                        stock: 49,
                        sku: 'SKU-03',
                        categoryId
                    },
                )
        })

        it('return all active products with no filters', async () => {
            const response = await request(app)
                .get('/api/v1/products')
                .expect(200)

            const products = response.body.data
            expect(products).toHaveLength(3)

            const names = products.map(p => p.name)
            expect(names).toEqual(
                expect.arrayContaining(['White Sneakers', 'Hp', 'Grey Sneakers'])
            )
        })

        it('filters by search term, case-insensitively', async () => {
            const response = await request(app)
                .get('/api/v1/products')
                .query({ search: 'sneakers' })
                .expect(200)

            const products = response.body.data
            expect(products).toHaveLength(2)

            const names = products.map(p => p.name)
            expect(names).toEqual(
                expect.arrayContaining(['White Sneakers', 'Grey Sneakers'])
            )
            expect(names).not.toContain('Hp')
        })

        it('filters by price range', async () => {
            const response = await request(app)
                .get('/api/v1/products')
                .query({ priceMin: 100 })
                .expect(200)

            const products = response.body.data
            expect(products).toHaveLength(1)
            expect(products[0].name).toBe('Hp')
            expect(products[0].price).toBe(35799)
        })

        it('sorts by price descending', async () => {
            const response = await request(app)
                .get('/api/v1/products')
                .query({ sort: 'price', order: 'desc' })
                .expect(200)

            const products = response.body.data
            expect(products).toHaveLength(3)

            expect(products[0].name).toBe('Hp')
            expect(products[0].price).toBe(35799)
        })
    })
})