const request = require('supertest');
const app = require('../src/app');
const { cleanDatabase, disconnectDatabase } = require('./setup');
const { createApprovedVendorWithStore, createAdminAndCategory } = require('./helpers');

async function createCustomer(email = 'customer@example.com') {
    await request(app).post('/api/v1/auth/register').send({
        email, name: 'Test Customer', password: 'password123',
    });
    const loginResponse = await request(app).post('/api/v1/auth/login').send({
        email, password: 'password123',
    });
    return loginResponse.body.data.accessToken;
}

describe('Carts endpoints', () => {
    let customerToken, productId, productPrice, vendorToken;

    beforeEach(async () => {
        await cleanDatabase();

        const vendor = await createApprovedVendorWithStore();
        vendorToken = vendor.accessToken
        const { categoryId } = await createAdminAndCategory();

        const productResponse = await request(app)
            .post('/api/v1/products')
            .set('Authorization', `Bearer ${vendor.accessToken}`)
            .send({ name: 'Cart Test Product', description: 'x', price: 10, stock: 5, sku: 'CART-1', categoryId });

        productId = productResponse.body.data.id;
        productPrice = productResponse.body.data.price;

        customerToken = await createCustomer();
    });

    afterAll(async () => {
        await disconnectDatabase();
    });

    describe('POST /api/v1/cart/items', () => {
        it('adds a new item to the cart', async () => {
            const response = await request(app)
                .post('/api/v1/cart/items')
                .set('Authorization', `Bearer ${customerToken}`)
                .send({ productId, quantity: 2 })
                .expect(200)

            expect(response.body.success).toBe(true)
            expect(response.body.data.items).toHaveLength(1)
            expect(response.body.data.items[0]).toMatchObject({
                productId,
                quantity: 2,
            })
        })

        it('increments quantity when adding the same product again', async () => {
            await request(app)
                .post('/api/v1/cart/items')
                .set('Authorization', `Bearer ${customerToken}`)
                .send({ productId, quantity: 2 })
                .expect(200)

            const response = await request(app)
                .post('/api/v1/cart/items')
                .set('Authorization', `Bearer ${customerToken}`)
                .send({ productId, quantity: 1 })
                .expect(200)

            expect(response.body.success).toBe(true)
            expect(response.body.data.items).toHaveLength(1)
            expect(response.body.data.items[0].quantity).toBe(3)
        })

        it('rejects when quantity exceeds available stock', async () => {
            const response = await request(app)
                .post('/api/v1/cart/items')
                .set('Authorization', `Bearer ${customerToken}`)
                .send({ productId, quantity: 6 })
                .expect(400)

            expect(response.body).toHaveProperty('error')
            expect(response.body.error).toMatch(/available stock|exceeds/i)
        })
    })

    describe('GET /api/v1/cart', () => {
        it('returns correct computed total', async () => {
            await request(app)
                .post('/api/v1/cart/items')
                .set('Authorization', `Bearer ${customerToken}`)
                .send({ productId, quantity: 3 })
                .expect(200)

            const response = await request(app)
                .get('/api/v1/cart')
                .set('Authorization', `Bearer ${customerToken}`)
                .expect(200)

            expect(response.body.success).toBe(true)
            expect(response.body.data.items).toHaveLength(1)
            expect(response.body.data.total).toBe(3 * productPrice)
        })
    });

    describe('PATCH /api/v1/cart/items/:id', () => {
        it('updates quantity to an absolute value', async () => {
            const addResponse = await request(app)
                .post('/api/v1/cart/items')
                .set('Authorization', `Bearer ${customerToken}`)
                .send({ productId, quantity: 2 })
                .expect(200)

            const cartItemId = addResponse.body.data.items[0].id

            const response = await request(app)
                .patch(`/api/v1/cart/items/${cartItemId}`)
                .set('Authorization', `Bearer ${customerToken}`)
                .send({ quantity: 5 })
                .expect(200)

            expect(response.body.success).toBe(true)
            expect(response.body.data.items).toHaveLength(1)
            expect(response.body.data.items[0].id).toBe(cartItemId)
            expect(response.body.data.items[0].quantity).toBe(5)
        })

        it('returns 404 for a cart item belonging to a different user', async () => {
            const firstCustomerToken = customerToken
            const secondCustomerToken = await createCustomer('othercustomer@example.com')

            const addResponse = await request(app)
                .post('/api/v1/cart/items')
                .set('Authorization', `Bearer ${firstCustomerToken}`)
                .send({ productId, quantity: 2 })
                .expect(200)

            const cartItemId = addResponse.body.data.items[0].id

            const response = await request(app)
                .patch(`/api/v1/cart/items/${cartItemId}`)
                .set('Authorization', `Bearer ${secondCustomerToken}`)
                .send({ quantity: 4 })
                .expect(404)

            expect(response.body).toHaveProperty('error')
        })
    });

    describe('DELETE /api/v1/cart/items/:id', () => {
        it('removes the item from the cart', async () => {
            const addResponse = await request(app)
                .post('/api/v1/cart/items')
                .set('Authorization', `Bearer ${customerToken}`)
                .send({ productId, quantity: 2 })
                .expect(200)

            const cartItemId = addResponse.body.data.items[0].id

            const deleteResponse = await request(app)
                .delete(`/api/v1/cart/items/${cartItemId}`)
                .set('Authorization', `Bearer ${customerToken}`)
                .expect(200)

            expect(deleteResponse.body.success).toBe(true)
            expect(deleteResponse.body.message).toMatch(/deleted/i)

            const cartResponse = await request(app)
                .get('/api/v1/cart')
                .set('Authorization', `Bearer ${customerToken}`)
                .expect(200)

            expect(cartResponse.body.data.items).toHaveLength(0)
            expect(cartResponse.body.data.total).toBe(0)
        })
    })

    describe('POST /api/v1/cart/items (inactive product)', () => {
        it('rejects adding an inactive product to the cart', async () => {
            const deactivateResponse = await request(app)
                .patch(`/api/v1/products/${productId}`)
                .set('Authorization', `Bearer ${vendorToken}`)
                .send({ isActive: false })
                .expect(200)

            expect(deactivateResponse.body.data.isActive).toBe(false)

            const response = await request(app)
                .post('/api/v1/cart/items')
                .set('Authorization', `Bearer ${customerToken}`)
                .send({ productId, quantity: 1 })
                .expect(400)

            expect(response.body).toHaveProperty('error')
            expect(response.body.error).toMatch(/active/i)
        });
    });
});