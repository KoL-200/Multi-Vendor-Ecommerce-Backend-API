const request = require('supertest')

const app = require('../src/app')

const { cleanDatabase, disconnectDatabase } = require('./setup')


describe('POST /api/v1/auth/register', () => {
    beforeEach(async () => {
        await cleanDatabase()
    })

    afterAll(async () => {
        await disconnectDatabase()
    })

    it('creates a new user with valid data', async () => {
        const userData = {
            email: 'carlos@gmail.com',
            name: 'Carlos',
            password: 'carlos123'
        }

        const response = await request(app)
            .post('/api/v1/auth/register')
            .send(userData)
            .expect(201)

        expect(response.body).toHaveProperty('success', true)
        expect(response.body.data).toHaveProperty('email', userData.email)
        expect(response.body.data.password).toBeUndefined()
        expect(response.body.data.passwordHash).toBeUndefined()
    })

    it('rejects a duplicate email', async () => {
        const userData = {
            email: 'carlos@gmail.com',
            name: 'Carlos',
            password: 'carlos123'
        }

        await request(app).post('/api/v1/auth/register').send(userData).expect(201)

        const response = await request(app)
            .post('/api/v1/auth/register')
            .send(userData)
            .expect(409)

        expect(response.body).toHaveProperty('error')
        expect(response.body.error).toMatch(/email|exists/i)
    })

    it('rejects a password shorter than 8 characters', async () => {
        const userData = {
            email: 'carlos@gmail.com',
            name: 'Carlos',
            password: 'carlos'
        }

        const response = await request(app)
            .post('/api/v1/auth/register')
            .send(userData)
            .expect(400)

        expect(response.body).toHaveProperty('error')
        expect(response.body.error).toMatch(/password/i)
    })
})

describe('POST /api/v1/auth/login', () => {
    beforeEach(async () => {
        await cleanDatabase()

        await request(app).post('/api/v1/auth/register')
            .send({
                email: 'carlos@gmail.com',
                name: 'Carlos',
                password: 'carlos123'
            })
    })

    afterAll(async () => {
        await disconnectDatabase()
    })

    it('logs in with correct credentials', async () => {
        const loginCredentials = {
            email: 'carlos@gmail.com',
            password: 'carlos123'
        }

        const response = await request(app)
            .post('/api/v1/auth/login')
            .send(loginCredentials)
            .expect(200)

        expect(response.body.data).toHaveProperty('accessToken')
        expect(response.body.data).toHaveProperty('refreshToken')
        expect(response.body.data.user).toMatchObject({
            email: 'carlos@gmail.com',
            name: 'Carlos'
        })
        expect(response.body.data.user.password).toBeUndefined()
        expect(response.body.data.user.passwordHash).toBeUndefined()
    })

    it('rejects an incorrect password', async () => {
        const loginCredentials = {
            email: 'carlos@gmail.com',
            password: 'calros123'
        }
        const response = await request(app)
            .post('/api/v1/auth/login')
            .send(loginCredentials)
            .expect(401)

        expect(response.body).toHaveProperty('error')
        expect(response.body.error).toMatch(/invalid credentials/i)
    })

    it('rejects a non-existent email', async () => {
        const loginCredentials = {
            email: 'veronica@gmail.com',
            password: 'carlos123'
        }
        const response = await request(app)
            .post('/api/v1/auth/login')
            .send(loginCredentials)
            .expect(401)

        expect(response.body).toHaveProperty('error')
        expect(response.body.error).toMatch(/invalid credentials/i)
    })
})