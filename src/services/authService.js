const { findUserByEmail, createUser, createRefreshToken } = require('../repositories/userRepository')

const { Conflict, UnauthorizedError } = require('../utils/AppError')

const { hashPassword, comparePassword } = require('../utils/password')

const ms = require('ms')

const { signAccessToken, signRefreshToken } = require('../utils/jwt')

const createNewUser = async ({ email, password, name }) => {
    const user = await findUserByEmail(email)
    if (user) {
        throw new Conflict('User already exists')
    }
    const hashedPassword = await hashPassword(password)

    const newUser = await createUser({ email, password: hashedPassword, name })

    const { password: _removed, ...safeUser } = newUser
    return safeUser
}

const loginUser = async ({ email, password, userAgent }) => {
    const user = await findUserByEmail(email)
    if (!user) {
        throw new UnauthorizedError('Invalid credentials')
    }
    const isMatch = await comparePassword(password, user.password)
    if (!isMatch) {
        throw new UnauthorizedError('Invalid credentials')
    }

    const accessToken = signAccessToken(user)
    const refreshToken = signRefreshToken(user)

    const refreshTokenHash = await hashPassword(refreshToken)

    const expiresAt = new Date(Date.now() + ms(process.env.JWT_REFRESH_EXPIRATION))

    await createRefreshToken({
        userId: user.id,
        tokenHash: refreshTokenHash,
        userAgent,
        expiresAt
    })

    const { password: _removed, ...safeUser } = user
    return { accessToken, refreshToken, user: safeUser }
}

module.exports = {
    createNewUser,
    loginUser
}
