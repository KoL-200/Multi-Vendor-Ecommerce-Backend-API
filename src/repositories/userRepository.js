const { id } = require('zod/v4/locales')
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

function findRefreshTokensByUserId(userId) {
    return prisma.refreshToken.findMany({ where: { userId, revokedAt: null } });
}

function findRevokedRefreshTokensByUserId(userId) {
    return prisma.refreshToken.findMany({ where: { userId, revokedAt: { not: null } } });
}

function revokeAllUserRefreshTokens(userId) {
    return prisma.refreshToken.updateMany({
        where: { userId, revokedAt: null },
        data: { revokedAt: new Date() }
    })
}

function revokeRefreshToken(tokenId) {
    return prisma.refreshToken.update({
        where: { id: tokenId },
        data: { revokedAt: new Date() }
    })
}

function findUserById(userId) {
    return prisma.user.findUnique({
        where: { id: userId }
    })
}

function updateUser(userId, data) {
    return prisma.user.update(
        {
            where: { id: userId },
            data
        }
    )
}

module.exports = {
    findUserByEmail,
    createUser,
    createRefreshToken,
    findRefreshTokensByUserId,
    findRevokedRefreshTokensByUserId,
    revokeAllUserRefreshTokens,
    revokeRefreshToken,
    findUserById,
    updateUser
}