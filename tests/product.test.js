const request = require('supertest')

const app = require('../src/app')

const { cleanDatabase, disconnectDatabase } = require('./setup')
const { createApprovedVendorWithStore, createAdminAndCategory } = require('./helpers')

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

    describe('GET /api/v1/products/:id', () => {
        it('returns a product by id', async () => {
            const { accessToken } = await createApprovedVendorWithStore('vendor-get@example.com')
            const { categoryId } = await createAdminAndCategory()

            const createResponse = await request(app)
                .post('/api/v1/products')
                .set('Authorization', `Bearer ${accessToken}`)
                .send(
                    {
                        name: 'Blue Mug',
                        description: 'Ceramic coffee mug',
                        price: 24.99,
                        stock: 15,
                        sku: 'MUG-001',
                        categoryId
                    }
                )
                .expect(201)

            const response = await request(app)
                .get(`/api/v1/products/${createResponse.body.data.id}`)
                .expect(200)

            expect(response.body.data).toMatchObject({
                id: createResponse.body.data.id,
                name: 'Blue Mug',
                sku: 'MUG-001',
                stock: 15,
            })
            expect(response.body.data.price).toBe(2499)
            expect(response.body.data.averageRating).toBe(0)
            expect(response.body.data.reviewCount).toBe(0)
        })

        it('returns 404 for a nonexistent id', async () => {
            const response = await request(app)
                .get('/api/v1/products/00000000-0000-0000-0000-000000000000')
                .expect(404)

            expect(response.body).toHaveProperty('error')
        })
    })

    describe('PATCH /api/v1/products/:id', () => {
        it('allows the owning vendor to update their product', async () => {
            const { accessToken } = await createApprovedVendorWithStore('vendor-update@example.com')
            const { categoryId } = await createAdminAndCategory()

            const createResponse = await request(app)
                .post('/api/v1/products')
                .set('Authorization', `Bearer ${accessToken}`)
                .send(
                    {
                        name: 'Original Lamp',
                        description: 'Desk lamp',
                        price: 49.99,
                        stock: 8,
                        sku: 'LAMP-001',
                        categoryId
                    }
                )
                .expect(201)

            const response = await request(app)
                .patch(`/api/v1/products/${createResponse.body.data.id}`)
                .set('Authorization', `Bearer ${accessToken}`)
                .send(
                    {
                        name: 'Updated Lamp',
                        stock: 12
                    }
                )
                .expect(200)

            expect(response.body.data).toMatchObject({
                id: createResponse.body.data.id,
                name: 'Updated Lamp',
                stock: 12,
            })
        })

        it('rejects a non-owner vendor from updating', async () => {
            const ownerVendor = await createApprovedVendorWithStore('owner-update@example.com')
            const secondVendor = await createApprovedVendorWithStore('rival-update@example.com')
            const { categoryId } = await createAdminAndCategory()

            const createResponse = await request(app)
                .post('/api/v1/products')
                .set('Authorization', `Bearer ${ownerVendor.accessToken}`)
                .send(
                    {
                        name: 'Owner Product',
                        description: 'Owned by first vendor',
                        price: 59.99,
                        stock: 4,
                        sku: 'OWNER-001',
                        categoryId
                    }
                )
                .expect(201)

            const response = await request(app)
                .patch(`/api/v1/products/${createResponse.body.data.id}`)
                .set('Authorization', `Bearer ${secondVendor.accessToken}`)
                .send({ name: 'Hacked Product' })
                .expect(403)

            expect(response.body).toHaveProperty('error')
        })

        it('allows Admin to update any product', async () => {
            const { accessToken } = await createApprovedVendorWithStore('admin-update-owner@example.com')
            const { categoryId, adminAccessToken } = await createAdminAndCategory()

            const createResponse = await request(app)
                .post('/api/v1/products')
                .set('Authorization', `Bearer ${accessToken}`)
                .send(
                    {
                        name: 'Admin Target Product',
                        description: 'Product to be edited by admin',
                        price: 69.99,
                        stock: 7,
                        sku: 'ADMIN-TARGET-001',
                        categoryId
                    }
                )
                .expect(201)

            const response = await request(app)
                .patch(`/api/v1/products/${createResponse.body.data.id}`)
                .set('Authorization', `Bearer ${adminAccessToken}`)
                .send({ name: 'Product Edited by Admin', stock: 20 })
                .expect(200)

            expect(response.body.data).toMatchObject({
                id: createResponse.body.data.id,
                name: 'Product Edited by Admin',
                stock: 20,
            })
        })

        it('rejects adding an inactive product to the cart', async () => {
            const { accessToken: vendorToken } = await createApprovedVendorWithStore('vendor-inactive@example.com')
            const { categoryId } = await createAdminAndCategory()

            const createResponse = await request(app)
                .post('/api/v1/products')
                .set('Authorization', `Bearer ${vendorToken}`)
                .send(
                    {
                        name: 'Inactive Product',
                        description: 'Should not be addable to cart',
                        price: 39.99,
                        stock: 5,
                        sku: 'INACTIVE-001',
                        categoryId
                    }
                )
                .expect(201)

            const productId = createResponse.body.data.id

            const deactivateResponse = await request(app)
                .patch(`/api/v1/products/${productId}`)
                .set('Authorization', `Bearer ${vendorToken}`)
                .send({ isActive: false })
                .expect(200)

            expect(deactivateResponse.body.data.isActive).toBe(false)

            await request(app)
                .post('/api/v1/auth/register')
                .send({
                    email: 'inactive-cart-customer@example.com',
                    name: 'Inactive Cart Customer',
                    password: 'password123'
                })
                .expect(201)

            const loginResponse = await request(app)
                .post('/api/v1/auth/login')
                .send({
                    email: 'inactive-cart-customer@example.com',
                    password: 'password123'
                })
                .expect(200)

            const response = await request(app)
                .post('/api/v1/cart/items')
                .set('Authorization', `Bearer ${loginResponse.body.data.accessToken}`)
                .send({ productId, quantity: 1 })
                .expect(400)

            expect(response.body).toHaveProperty('error')
            expect(response.body.error).toMatch(/active/i)
        });
    })

    describe('DELETE /api/v1/products/:id', () => {
        it('allows the owning vendor to delete their product', async () => {
            const { accessToken } = await createApprovedVendorWithStore('vendor-delete@example.com')
            const { categoryId } = await createAdminAndCategory()

            const createResponse = await request(app)
                .post('/api/v1/products')
                .set('Authorization', `Bearer ${accessToken}`)
                .send(
                    {
                        name: 'Delete Me Product',
                        description: 'Will be deleted by owner',
                        price: 19.99,
                        stock: 3,
                        sku: 'DELETE-001',
                        categoryId
                    }
                )
                .expect(201)

            const response = await request(app)
                .delete(`/api/v1/products/${createResponse.body.data.id}`)
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(200)

            expect(response.body).toHaveProperty('message', 'Product deleted successfully')

            await request(app)
                .get(`/api/v1/products/${createResponse.body.data.id}`)
                .expect(404)
        })

        it('rejects a non-owner from deleting', async () => {
            const ownerVendor = await createApprovedVendorWithStore('owner-delete@example.com')
            const secondVendor = await createApprovedVendorWithStore('rival-delete@example.com')
            const { categoryId } = await createAdminAndCategory()

            const createResponse = await request(app)
                .post('/api/v1/products')
                .set('Authorization', `Bearer ${ownerVendor.accessToken}`)
                .send(
                    {
                        name: 'Protected Product',
                        description: 'Cannot be deleted by another vendor',
                        price: 89.99,
                        stock: 6,
                        sku: 'PROTECTED-001',
                        categoryId
                    }
                )
                .expect(201)

            const response = await request(app)
                .delete(`/api/v1/products/${createResponse.body.data.id}`)
                .set('Authorization', `Bearer ${secondVendor.accessToken}`)
                .expect(403)

            expect(response.body).toHaveProperty('error')
        })
    })
})