const { prisma } = require('../config/database')

function findUserByEmail(email) {
    return prisma.user.findUnique({
        where: { email }
    })
}

function createUser({ email, password, name }) {
    return prisma.user.create({
        data: {
            email,
            password,
            name
        },
    })
}

function createRefreshToken({ userId, tokenHash, userAgent, expiresAt }) {
    return prisma.refreshToken.create({
        data: {
            userId,
            tokenHash,
            userAgent,
            expiresAt
        }
    })
}

module.exports = {
    findUserByEmail,
    createUser,
    createRefreshToken
}