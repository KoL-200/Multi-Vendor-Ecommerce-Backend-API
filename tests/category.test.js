const request = require('supertest')
const app = require('../src/app')
const { cleanDatabase, disconnectDatabase } = require('./setup')
const { createAdmin, createAdminAndCategory } = require('./helpers')

describe('Category endpoints', () => {
    beforeEach(async () => {
        await cleanDatabase()
    })

    afterAll(async () => {
        await disconnectDatabase()
    })

    it('lists categories', async () => {
        const { adminAccessToken } = await createAdmin()

        await request(app)
            .post('/api/v1/categories')
            .set('Authorization', `Bearer ${adminAccessToken}`)
            .send({
                name: 'Electronics',
                description: 'Gadgets and accessories'
            })
            .expect(201)

        const response = await request(app)
            .get('/api/v1/categories')
            .expect(200)

        expect(response.body.success).toBe(true)
        expect(response.body.data).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    name: 'Electronics',
                    description: 'Gadgets and accessories'
                })
            ])
        )
    })

    it('gets a category by id', async () => {
        const { adminAccessToken, categoryId } = await createAdminAndCategory('Home Goods')

        const response = await request(app)
            .get(`/api/v1/categories/${categoryId}`)
            .expect(200)

        expect(response.body.success).toBe(true)
        expect(response.body.data).toMatchObject({
            id: categoryId,
            name: 'Home Goods'
        })
    })

    it('creates a category for an admin', async () => {
        const { adminAccessToken } = await createAdmin()

        const response = await request(app)
            .post('/api/v1/categories')
            .set('Authorization', `Bearer ${adminAccessToken}`)
            .send({
                name: 'Books',
                description: 'Reading materials'
            })
            .expect(201)

        expect(response.body.success).toBe(true)
        expect(response.body.data).toMatchObject({
            name: 'Books',
            description: 'Reading materials'
        })
    })

    it('rejects duplicate category names', async () => {
        const { adminAccessToken } = await createAdmin()

        await request(app)
            .post('/api/v1/categories')
            .set('Authorization', `Bearer ${adminAccessToken}`)
            .send({
                name: 'Furniture',
                description: 'Home furniture'
            })
            .expect(201)

        const response = await request(app)
            .post('/api/v1/categories')
            .set('Authorization', `Bearer ${adminAccessToken}`)
            .send({
                name: 'Furniture',
                description: 'Another description'
            })
            .expect(409)

        expect(response.body).toHaveProperty('error')
    })

    it('rejects non-admin category creation', async () => {
        await request(app)
            .post('/api/v1/auth/register')
            .send({
                email: 'plainuser@example.com',
                name: 'Regular User',
                password: 'password123'
            })
            .expect(201)

        const loginResponse = await request(app)
            .post('/api/v1/auth/login')
            .send({
                email: 'plainuser@example.com',
                password: 'password123'
            })
            .expect(200)

        const response = await request(app)
            .post('/api/v1/categories')
            .set('Authorization', `Bearer ${loginResponse.body.data.accessToken}`)
            .send({
                name: 'Forbidden Category',
                description: 'Not allowed'
            })
            .expect(403)

        expect(response.body).toHaveProperty('error')
    })

    it('updates a category as admin', async () => {
        const { adminAccessToken, categoryId } = await createAdminAndCategory('Office Supply')

        const response = await request(app)
            .patch(`/api/v1/categories/${categoryId}`)
            .set('Authorization', `Bearer ${adminAccessToken}`)
            .send({
                name: 'Office Supplies',
                description: 'Paper and desk items'
            })
            .expect(200)

        expect(response.body.success).toBe(true)
        expect(response.body.data).toMatchObject({
            id: categoryId,
            name: 'Office Supplies',
            description: 'Paper and desk items'
        })
    })

    it('deletes a category as admin', async () => {
        const { adminAccessToken, categoryId } = await createAdminAndCategory('Toys')

        const response = await request(app)
            .delete(`/api/v1/categories/${categoryId}`)
            .set('Authorization', `Bearer ${adminAccessToken}`)
            .expect(200)

        expect(response.body.success).toBe(true)
        expect(response.body.message).toMatch(/deleted successfully/i)
    })
})
