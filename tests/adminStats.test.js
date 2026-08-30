const request = require('supertest')
const app = require('../src/app')
const { prisma } = require('../src/config/database')
const { cleanDatabase, disconnectDatabase } = require('./setup')
const { createAdmin, createApprovedVendorWithStore } = require('./helpers')

async function createCustomer(email = 'admin-stats-customer@example.com') {
    await request(app)
        .post('/api/v1/auth/register')
        .send({
            email,
            name: 'Stats Customer',
            password: 'password123'
        })

    const loginResponse = await request(app)
        .post('/api/v1/auth/login')
        .send({ email, password: 'password123' })

    return {
        userId: loginResponse.body.data.user.id,
        accessToken: loginResponse.body.data.accessToken
    }
}

async function createCategory(name = 'Admin Stats Category') {
    return prisma.category.create({
        data: {
            name,
            description: 'For admin stats tests'
        }
    })
}

async function createProductForVendor({ vendorAccessToken, categoryId, productName = 'Stat Product' }) {
    const response = await request(app)
        .post('/api/v1/products')
        .set('Authorization', `Bearer ${vendorAccessToken}`)
        .send({
            name: productName,
            description: 'Product used for admin stats',
            price: 25,
            stock: 20,
            sku: `${productName.replace(/\s+/g, '-').toUpperCase()}-1`,
            categoryId
        })
        .expect(201)

    return response.body.data
}

async function createOrderWithItems({ customerId, status = 'DELIVERED', totalAmount = 2500, productId, quantity = 2 }) {
    return prisma.order.create({
        data: {
            customerId,
            status,
            totalAmount,
            shippingName: 'Jane Doe',
            shippingAddress: '123 Market Street',
            shippingCity: 'Lagos',
            shippingPostalCode: '100001',
            shippingPhone: '08012345678',
            items: {
                create: [{
                    productId,
                    quantity,
                    priceAtPurchase: 1250
                }]
            }
        }
    })
}

describe('Admin stats endpoints', () => {
    beforeEach(async () => {
        await cleanDatabase()
    })

    afterAll(async () => {
        await disconnectDatabase()
    })

    it('returns overview stats for the admin dashboard', async () => {
        const { adminAccessToken } = await createAdmin()
        const customer = await createCustomer('overview-admin-stats@example.com')

        const vendor = await createApprovedVendorWithStore('vendor-admin-stats@example.com')
        const category = await createCategory('Overview Category')
        const product = await createProductForVendor({
            vendorAccessToken: vendor.accessToken,
            categoryId: category.id,
            productName: 'Overview Product'
        })

        await createOrderWithItems({
            customerId: customer.userId,
            status: 'DELIVERED',
            totalAmount: 2500,
            productId: product.id,
            quantity: 2
        })

        const response = await request(app)
            .get('/api/v1/admins/stats/overview')
            .set('Authorization', `Bearer ${adminAccessToken}`)
            .expect(200)

        expect(response.body.success).toBe(true)
        expect(response.body.data).toMatchObject({
            totalUsers: 3,
            totalVendors: 1,
            totalProducts: 1,
            totalOrders: 1
        })
    })

    it('returns total revenue for delivered and shipped orders only', async () => {
        const { adminAccessToken } = await createAdmin()
        const customer = await createCustomer('revenue-admin-stats@example.com')

        const vendor = await createApprovedVendorWithStore('vendor-revenue-admin@example.com')
        const category = await createCategory('Revenue Category')
        const product = await createProductForVendor({
            vendorAccessToken: vendor.accessToken,
            categoryId: category.id,
            productName: 'Revenue Product'
        })

        await createOrderWithItems({
            customerId: customer.userId,
            status: 'DELIVERED',
            totalAmount: 2500,
            productId: product.id,
            quantity: 2
        })

        await createOrderWithItems({
            customerId: customer.userId,
            status: 'PENDING_PAYMENT',
            totalAmount: 9999,
            productId: product.id,
            quantity: 1
        })

        const response = await request(app)
            .get('/api/v1/admins/stats/revenue')
            .set('Authorization', `Bearer ${adminAccessToken}`)
            .expect(200)

        expect(response.body.success).toBe(true)
        expect(response.body.data.totalRevenue).toBe(2500)
    })

    it('returns the top-selling products for the admin dashboard', async () => {
        const { adminAccessToken } = await createAdmin()
        const customer = await createCustomer('best-seller-admin-stats@example.com')

        const vendor = await createApprovedVendorWithStore('vendor-best-seller-admin@example.com')
        const category = await createCategory('Best Seller Category')

        const productA = await createProductForVendor({
            vendorAccessToken: vendor.accessToken,
            categoryId: category.id,
            productName: 'Best Seller Product A'
        })

        const productB = await createProductForVendor({
            vendorAccessToken: vendor.accessToken,
            categoryId: category.id,
            productName: 'Best Seller Product B'
        })

        await createOrderWithItems({
            customerId: customer.userId,
            status: 'DELIVERED',
            totalAmount: 2000,
            productId: productA.id,
            quantity: 3
        })

        await createOrderWithItems({
            customerId: customer.userId,
            status: 'SHIPPED',
            totalAmount: 1500,
            productId: productB.id,
            quantity: 2
        })

        const response = await request(app)
            .get('/api/v1/admins/stats/best-sellers')
            .query({ limit: 5 })
            .set('Authorization', `Bearer ${adminAccessToken}`)
            .expect(200)

        expect(response.body.success).toBe(true)
        expect(response.body.data).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    productId: productA.id,
                    totalSold: 3,
                    name: productA.name
                }),
                expect.objectContaining({
                    productId: productB.id,
                    totalSold: 2,
                    name: productB.name
                })
            ])
        )
    })

    it('rejects stats access for non-admin users', async () => {
        const customer = await createCustomer('non-admin-stats@example.com')

        const response = await request(app)
            .get('/api/v1/admins/stats/overview')
            .set('Authorization', `Bearer ${customer.accessToken}`)
            .expect(403)

        expect(response.body).toHaveProperty('error')
        expect(response.body.error).toMatch(/admin access required|admin/i)
    })
})
