const request = require('supertest')

const app = require('../src/app')

const { cleanDatabase, disconnectDatabase } = require('./setup')
const {
    createApprovedVendorWithStore,
    registerVendorWithoutApproval,
    createAdminAndCategory
} = require('./helpers')

describe('Store endpoints', () => {
    beforeEach(async () => {
        await cleanDatabase()
    })

    afterAll(async () => {
        await disconnectDatabase()
    })

    describe('POST /api/v1/stores', () => {
        it('creates a store for an approved vendor', async () => {

            await request(app)
                .post('/api/v1/auth/register')
                .send({
                    email: 'approved-store-owner@example.com',
                    name: 'Store User',
                    password: 'password123'
                })
                .expect(201)

            const loginResponse = await request(app)
                .post('/api/v1/auth/login')
                .send({
                    email: 'approved-store-owner@example.com',
                    password: 'password123'
                })
                .expect(200)

            const { accessToken, user } = loginResponse.body.data

            await require('../src/config/database').prisma.user.update({
                where: { id: user.id },
                data: { vendorStatus: 'APPROVED' }
            })

            const response = await request(app)
                .post('/api/v1/stores')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({
                    name: 'Approved Store',
                    description: 'A valid approved vendor store',
                    phone: '09012345678',
                    address: '12 Market Road'
                })
                .expect(201)

            expect(response.body.success).toBe(true)
            expect(response.body.data).toMatchObject({
                name: 'Approved Store',
                address: '12 Market Road'
            })
        })

        it('rejects a non-approved vendor from creating a store', async () => {
            const { accessToken } = await registerVendorWithoutApproval('pending-store-owner@example.com')

            const response = await request(app)
                .post('/api/v1/stores')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({
                    name: 'Blocked Store',
                    description: 'Should not be allowed',
                    phone: '09011111111',
                    address: 'No address'
                })
                .expect(403)

            expect(response.body).toHaveProperty('error')
        })

        it('rejects creating a second store for the same vendor', async () => {
            const { accessToken } = await createApprovedVendorWithStore('owner-only-one-store@example.com')

            const response = await request(app)
                .post('/api/v1/stores')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({
                    name: 'Second Store Attempt',
                    description: 'Not allowed',
                    phone: '09033333333',
                    address: 'A different place'
                })
                .expect(409)

            expect(response.body).toHaveProperty('error')
        })
    })

    describe('PATCH /api/v1/stores/:id', () => {
        it('allows the owner to update their store', async () => {
            const { accessToken, storeId } = await createApprovedVendorWithStore('owner-update-store@example.com')

            const response = await request(app)
                .patch(`/api/v1/stores/${storeId}`)
                .set('Authorization', `Bearer ${accessToken}`)
                .send({
                    name: 'Owner Updated Store Name',
                    address: 'Updated Market Street'
                })
                .expect(200)

            expect(response.body.success).toBe(true)
            expect(response.body.data).toMatchObject({
                id: storeId,
                name: 'Owner Updated Store Name',
                address: 'Updated Market Street'
            })
        })

        it('allows an admin to update any store', async () => {
            const { storeId } = await createApprovedVendorWithStore('admin-update-store-owner@example.com')
            const { adminAccessToken } = await createAdminAndCategory()

            const response = await request(app)
                .patch(`/api/v1/stores/${storeId}`)
                .set('Authorization', `Bearer ${adminAccessToken}`)
                .send({
                    name: 'Admin Updated Store',
                    phone: '09055555555'
                })
                .expect(200)

            expect(response.body.success).toBe(true)
            expect(response.body.data).toMatchObject({
                id: storeId,
                name: 'Admin Updated Store',
                phone: '09055555555'
            })
        })

        it('rejects a non-owner from updating a store', async () => {
            const firstVendor = await createApprovedVendorWithStore('first-store-owner@example.com')
            const secondVendor = await createApprovedVendorWithStore('second-store-owner@example.com')

            const response = await request(app)
                .patch(`/api/v1/stores/${firstVendor.storeId}`)
                .set('Authorization', `Bearer ${secondVendor.accessToken}`)
                .send({ name: 'Should Not Update' })
                .expect(403)

            expect(response.body).toHaveProperty('error')
        })
    })
})