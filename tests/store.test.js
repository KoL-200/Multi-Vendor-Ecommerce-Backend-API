// const request = require('supertest')

// const app = require('../src/app')

// const { cleanDatabase, disconnectDatabase } = require('./setup')

// describe('POST /api/v1/stores', () => {
//     beforeEach(async () => {
//         await cleanDatabase()

//         await request(app).post('/api/v1/auth/login')
//             .send({
//                 email: 'carlos@gmail.com',
//                 password: 'carlos123'
//             })
//     })

//     afterAll(async () => {
//         await disconnectDatabase()
//     })

//     it('creates a store', async () => {
//         const storeData = {
//             name: 'carlos store',
//             desccription: 'The digital home',
//             phone: '09047715678',
//             address: '12, carlos avenue'
//         }

//         const response = await request(app)
//             .post('/api/v1/stores')
//             .send(storeData)
//             .expect(201)

//         expect(response.body).toHaveProperty('success', true)
//         expect(response.body.data).toHaveProperty(storeData)
//         // expect(response.body.data.password).toBeUndefined()
//         // expect(response.body.data.passwordHash).toBeUndefined()
//     })

//     // it('rejects a duplicate email', async () => {
//     //     const userData = {
//     //         email: 'carlos@gmail.com',
//     //         name: 'Carlos',
//     //         password: 'carlos123'
//     //     }

//     //     await request(app).post('/api/v1/auth/register').send(userData).expect(201)

//     //     const response = await request(app)
//     //         .post('/api/v1/auth/register')
//     //         .send(userData)
//     //         .expect(409)

//     //     expect(response.body).toHaveProperty('error')
//     //     expect(response.body.error).toMatch(/email|exists/i)
//     // })

//     // it('rejects a password shorter than 8 characters', async () => {
//     //     const userData = {
//     //         email: 'carlos@gmail.com',
//     //         name: 'Carlos',
//     //         password: 'carlos'
//     //     }

//     //     const response = await request(app)
//     //         .post('/api/v1/auth/register')
//     //         .send(userData)
//     //         .expect(400)

//     //     expect(response.body).toHaveProperty('error')
//     //     expect(response.body.error).toMatch(/password/i)
//     // })
// })