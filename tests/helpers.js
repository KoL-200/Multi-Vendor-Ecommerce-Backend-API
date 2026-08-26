const request = require('supertest')

const app = require('../src/app')

const { prisma } = require('../src/config/database')
const { VendorStatus } = require('@prisma/client')

async function createApprovedVendorWithStore(email = 'george@gmail.com') {
    await request(app)
        .post('/api/v1/auth/register')
        .send(
            {
                email,
                name: 'George',
                password: 'george123'
            }
        )

    const loginResponse = await request(app)
        .post('/api/v1/auth/login')
        .send(
            {
                email,
                password: 'george123'
            }
        )

    const { accessToken, user } = loginResponse.body.data

    await prisma.user.update(
        {
            where: {
                id: user.id,
            },
            data: {
                vendorStatus: 'APPROVED'
            }
        }
    )

    const storeResponse = await request(app)
        .post('/api/v1/stores')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(
            {
                name: `${email}'s Store`
            }
        )

    return { accessToken, userId: user.id, storeId: storeResponse.body.data.id }
}

async function createAdminAndCategory(categoryName = 'Test Category') {
    await request(app)
        .post('/api/v1/auth/register')
        .send(
            {
                email: 'testAdmin@gmail.com',
                name: 'testAdmin',
                password: 'test1234'
            }
        )

    const loginResponse = await request(app)
        .post('/api/v1/auth/login')
        .send(
            {
                email: 'testAdmin@gmail.com',
                password: 'test1234'
            }
        )

    const { accessToken, user } = loginResponse.body.data

    await prisma.user.update(
        {
            where: {
                id: user.id,
            },
            data: {
                isAdmin: true
            }
        }
    )

    const reloginResponse = await request(app)
        .post('/api/v1/auth/login')
        .send(
            {
                email: 'testAdmin@gmail.com',
                password: 'test1234'
            }
        )

    const adminAccessToken = reloginResponse.body.data.accessToken

    const categoryResponse = await request(app)
        .post('/api/v1/categories')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(
            {
                name: 'categoryName'
            }
        )

    return { adminAccessToken, categoryId: categoryResponse.body.data.id }
}

module.exports = {
    createApprovedVendorWithStore,
    createAdminAndCategory
}