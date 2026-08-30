const request = require('supertest')
const app = require('../src/app')
const { prisma } = require('../src/config/database')
const { cleanDatabase, disconnectDatabase } = require('./setup')
const { createApprovedVendorWithStore, createAdminAndCategory, createAdmin } = require('./helpers')

async function createCustomer(email = 'customer-review@example.com') {
    await request(app)
        .post('/api/v1/auth/register')
        .send({
            email,
            name: 'Review Customer',
            password: 'password123'
        })

    const loginResponse = await request(app)
        .post('/api/v1/auth/login')
        .send({
            email,
            password: 'password123'
        })

    return {
        accessToken: loginResponse.body.data.accessToken,
        userId: loginResponse.body.data.user.id
    }
}

async function createProductForVendor(vendorToken, categoryId) {
    const response = await request(app)
        .post('/api/v1/products')
        .set('Authorization', `Bearer ${vendorToken}`)
        .send({
            name: 'Review Product',
            description: 'A product suitable for rating',
            price: 20,
            stock: 10,
            sku: 'REVIEW-PROD-1',
            categoryId
        })
        .expect(201)

    return response.body.data
}

async function createDeliveredPurchase({ customerId, productId, price, quantity = 1 }) {
    return prisma.order.create({
        data: {
            customerId,
            status: 'DELIVERED',
            totalAmount: price * quantity,
            shippingName: 'Jane Doe',
            shippingAddress: '123 Market Street',
            shippingCity: 'Lagos',
            shippingPostalCode: '100001',
            shippingPhone: '08012345678',
            items: {
                create: [
                    {
                        productId,
                        quantity,
                        priceAtPurchase: price
                    }
                ]
            }
        }
    })
}

describe('Review endpoints', () => {
    beforeEach(async () => {
        await cleanDatabase()
    })

    afterAll(async () => {
        await disconnectDatabase()
    })

    it('allows a customer to review a delivered product', async () => {
        const vendor = await createApprovedVendorWithStore('vendor-review@example.com')
        const { categoryId } = await createAdminAndCategory('Review Category')
        const product = await createProductForVendor(vendor.accessToken, categoryId)
        const customer = await createCustomer('customer1-review@example.com')

        await createDeliveredPurchase({
            customerId: customer.userId,
            productId: product.id,
            price: product.price,
            quantity: 1
        })

        const response = await request(app)
            .post(`/api/v1/products/${product.id}/reviews`)
            .set('Authorization', `Bearer ${customer.accessToken}`)
            .send({ rating: 5, comment: 'Excellent product' })
            .expect(201)

        expect(response.body.success).toBe(true)
        expect(response.body.data).toMatchObject({
            productId: product.id,
            userId: customer.userId,
            rating: 5,
            comment: 'Excellent product'
        })
    })

    it('rejects review creation when the user has not purchased the product', async () => {
        const vendor = await createApprovedVendorWithStore('vendor-review-2@example.com')
        const { categoryId } = await createAdminAndCategory('Review Category 2')
        const product = await createProductForVendor(vendor.accessToken, categoryId)
        const customer = await createCustomer('customer2-review@example.com')

        const response = await request(app)
            .post(`/api/v1/products/${product.id}/reviews`)
            .set('Authorization', `Bearer ${customer.accessToken}`)
            .send({ rating: 4, comment: 'I have not bought this yet' })
            .expect(400)

        expect(response.body).toHaveProperty('error')
        expect(response.body.error).toMatch(/purchased and received|purchased/i)
    })

    it('rejects duplicate reviews for the same product', async () => {
        const vendor = await createApprovedVendorWithStore('vendor-review-3@example.com')
        const { categoryId } = await createAdminAndCategory('Review Category 3')
        const product = await createProductForVendor(vendor.accessToken, categoryId)
        const customer = await createCustomer('customer3-review@example.com')

        await createDeliveredPurchase({
            customerId: customer.userId,
            productId: product.id,
            price: product.price,
            quantity: 1
        })

        await request(app)
            .post(`/api/v1/products/${product.id}/reviews`)
            .set('Authorization', `Bearer ${customer.accessToken}`)
            .send({ rating: 5, comment: 'First review' })
            .expect(201)

        const response = await request(app)
            .post(`/api/v1/products/${product.id}/reviews`)
            .set('Authorization', `Bearer ${customer.accessToken}`)
            .send({ rating: 3, comment: 'Second review' })
            .expect(409)

        expect(response.body).toHaveProperty('error')
        expect(response.body.error).toMatch(/already reviewed/i)
    })

    it('lists reviews for a product', async () => {
        const vendor = await createApprovedVendorWithStore('vendor-review-4@example.com')
        const { categoryId } = await createAdminAndCategory('Review Category 4')
        const product = await createProductForVendor(vendor.accessToken, categoryId)
        const customer = await createCustomer('customer4-review@example.com')

        await createDeliveredPurchase({
            customerId: customer.userId,
            productId: product.id,
            price: product.price,
            quantity: 1
        })

        const reviewResponse = await request(app)
            .post(`/api/v1/products/${product.id}/reviews`)
            .set('Authorization', `Bearer ${customer.accessToken}`)
            .send({ rating: 4, comment: 'Nice item' })
            .expect(201)

        const response = await request(app)
            .get(`/api/v1/products/${product.id}/reviews`)
            .expect(200)

        expect(response.body.success).toBe(true)
        expect(response.body.data).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    id: reviewResponse.body.data.id,
                    productId: product.id,
                    rating: 4,
                    comment: 'Nice item'
                })
            ])
        )
    })

    it('allows the review owner to update their review', async () => {
        const vendor = await createApprovedVendorWithStore('vendor-review-5@example.com')
        const { categoryId } = await createAdminAndCategory('Review Category 5')
        const product = await createProductForVendor(vendor.accessToken, categoryId)
        const customer = await createCustomer('customer5-review@example.com')

        await createDeliveredPurchase({
            customerId: customer.userId,
            productId: product.id,
            price: product.price,
            quantity: 1
        })

        const createdReview = await request(app)
            .post(`/api/v1/products/${product.id}/reviews`)
            .set('Authorization', `Bearer ${customer.accessToken}`)
            .send({ rating: 5, comment: 'Original comment' })
            .expect(201)

        const response = await request(app)
            .patch(`/api/v1/reviews/${createdReview.body.data.id}`)
            .set('Authorization', `Bearer ${customer.accessToken}`)
            .send({ rating: 4, comment: 'Updated comment' })
            .expect(200)

        expect(response.body.success).toBe(true)
        expect(response.body.data).toMatchObject({
            id: createdReview.body.data.id,
            rating: 4,
            comment: 'Updated comment'
        })
    })

    it('allows admin to delete a review', async () => {
        const vendor = await createApprovedVendorWithStore('vendor-review-6@example.com')
        const { categoryId } = await createAdminAndCategory('Review Category 6')
        const product = await createProductForVendor(vendor.accessToken, categoryId)
        const customer = await createCustomer('customer6-review@example.com')
        const { adminAccessToken } = await createAdmin()

        await createDeliveredPurchase({
            customerId: customer.userId,
            productId: product.id,
            price: product.price,
            quantity: 1
        })

        const createdReview = await request(app)
            .post(`/api/v1/products/${product.id}/reviews`)
            .set('Authorization', `Bearer ${customer.accessToken}`)
            .send({ rating: 5, comment: 'Delete me' })
            .expect(201)

        const response = await request(app)
            .delete(`/api/v1/reviews/${createdReview.body.data.id}`)
            .set('Authorization', `Bearer ${adminAccessToken}`)
            .expect(200)

        expect(response.body.success).toBe(true)
        expect(response.body.message).toMatch(/deleted/i)
    })
})
