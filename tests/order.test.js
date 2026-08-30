const request = require('supertest')
const app = require('../src/app')
const { cleanDatabase, disconnectDatabase } = require('./setup')
const { createApprovedVendorWithStore, createAdminAndCategory } = require('./helpers')

async function createCustomer(email = 'customer@example.com') {
    await request(app)
        .post('/api/v1/auth/register')
        .send({
            email,
            name: 'Test Customer',
            password: 'password123'
        })

    const loginResponse = await request(app)
        .post('/api/v1/auth/login')
        .send({
            email,
            password: 'password123'
        })

    return loginResponse.body.data.accessToken
}

describe('Order endpoints', () => {
    let customerToken
    let vendorToken
    let productId
    let productPrice

    beforeEach(async () => {
        await cleanDatabase()

        const vendor = await createApprovedVendorWithStore('vendor-order@example.com')
        vendorToken = vendor.accessToken

        const { categoryId } = await createAdminAndCategory()

        const productResponse = await request(app)
            .post('/api/v1/products')
            .set('Authorization', `Bearer ${vendorToken}`)
            .send({
                name: 'Order Test Product',
                description: 'Useful for checkout tests',
                price: 10,
                stock: 5,
                sku: 'ORDER-TEST-1',
                categoryId
            })
            .expect(201)

        productId = productResponse.body.data.id
        productPrice = productResponse.body.data.price

        customerToken = await createCustomer('customer-order@example.com')
    })

    afterAll(async () => {
        await disconnectDatabase()
    })

    const checkoutPayload = (overrides = {}) => ({
        shippingName: 'Jane Doe',
        shippingAddress: '123 Market Street',
        shippingCity: 'Lagos',
        shippingPostalCode: '100001',
        shippingPhone: '08012345678',
        ...overrides
    })

    it('creates an order from a valid cart', async () => {
        await request(app)
            .post('/api/v1/cart/items')
            .set('Authorization', `Bearer ${customerToken}`)
            .send({ productId, quantity: 2 })
            .expect(200)

        const response = await request(app)
            .post('/api/v1/orders')
            .set('Authorization', `Bearer ${customerToken}`)
            .send(checkoutPayload())
            .expect(201)

        expect(response.body.success).toBe(true)
        expect(response.body.data).toMatchObject({
            status: 'PENDING_PAYMENT',
            shippingName: 'Jane Doe',
            shippingAddress: '123 Market Street',
            totalAmount: 2 * productPrice
        })

        const cartResponse = await request(app)
            .get('/api/v1/cart')
            .set('Authorization', `Bearer ${customerToken}`)
            .expect(200)

        expect(cartResponse.body.data.items).toHaveLength(0)
        expect(cartResponse.body.data.total).toBe(0)
    })

    it('rejects checkout for an empty cart', async () => {
        const response = await request(app)
            .post('/api/v1/orders')
            .set('Authorization', `Bearer ${customerToken}`)
            .send(checkoutPayload())
            .expect(400)

        expect(response.body).toHaveProperty('error')
        expect(response.body.error).toMatch(/cart is empty/i)
    })

    it('rejects checkout when the product is stale at checkout time', async () => {
        await request(app)
            .post('/api/v1/cart/items')
            .set('Authorization', `Bearer ${customerToken}`)
            .send({ productId, quantity: 3 })
            .expect(200)

        await request(app)
            .patch(`/api/v1/products/${productId}`)
            .set('Authorization', `Bearer ${vendorToken}`)
            .send({ stock: 1 })
            .expect(200)

        const response = await request(app)
            .post('/api/v1/orders')
            .set('Authorization', `Bearer ${customerToken}`)
            .send(checkoutPayload())
            .expect(400)

        expect(response.body).toHaveProperty('error')
        expect(response.body.error).toMatch(/available stock|no longer active|exceeds/i)
    })

    it('lists the customer orders after checkout', async () => {
        await request(app)
            .post('/api/v1/cart/items')
            .set('Authorization', `Bearer ${customerToken}`)
            .send({ productId, quantity: 1 })
            .expect(200)

        const checkoutResponse = await request(app)
            .post('/api/v1/orders')
            .set('Authorization', `Bearer ${customerToken}`)
            .send(checkoutPayload())
            .expect(201)

        const response = await request(app)
            .get('/api/v1/orders')
            .set('Authorization', `Bearer ${customerToken}`)
            .expect(200)

        expect(response.body.success).toBe(true)
        expect(response.body.data).toHaveLength(1)
        expect(response.body.data[0].id).toBe(checkoutResponse.body.data.id)
    })

    it('allows a customer to cancel an order and restores stock', async () => {
        await request(app)
            .post('/api/v1/cart/items')
            .set('Authorization', `Bearer ${customerToken}`)
            .send({ productId, quantity: 2 })
            .expect(200)

        const checkoutResponse = await request(app)
            .post('/api/v1/orders')
            .set('Authorization', `Bearer ${customerToken}`)
            .send(checkoutPayload())
            .expect(201)

        const orderId = checkoutResponse.body.data.id

        const cancelResponse = await request(app)
            .patch(`/api/v1/orders/${orderId}/cancel`)
            .set('Authorization', `Bearer ${customerToken}`)
            .expect(200)

        expect(cancelResponse.body.success).toBe(true)
        expect(cancelResponse.body.data.status).toBe('CANCELLED')

        const productResponse = await request(app)
            .get(`/api/v1/products/${productId}`)
            .expect(200)

        expect(productResponse.body.data.stock).toBe(5)
    })
})
