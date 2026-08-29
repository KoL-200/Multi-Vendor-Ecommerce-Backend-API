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

describe('Cart endpoints', () => {
    let customerToken, productId, productPrice;

    beforeEach(async () => {
        await cleanDatabase();

        const vendor = await createApprovedVendorWithStore();
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
});