const jwt = require('jsonwebtoken');
const env = require('../config/env');

const { findUserByEmail,
    createUser,
    createRefreshToken,
    findRefreshTokensByUserId,
    findRevokedRefreshTokensByUserId,
    revokeAllUserRefreshTokens,
    revokeRefreshToken,
    findUserById } = require('../repositories/userRepository')

const { ConflictError, UnauthorizedError } = require('../utils/AppError')

const { hashPassword, comparePassword, findMatchingToken } = require('../utils/hashing')

const ms = require('ms')

const { signAccessToken, signRefreshToken } = require('../utils/jwt')


const createNewUser = async ({ email, password, name }) => {
    const user = await findUserByEmail(email)
    if (user) {
        throw new ConflictError('User already exists')
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

    const expiresAt = new Date(Date.now() + ms(env.JWT_REFRESH_EXPIRATION))

    await createRefreshToken({
        userId: user.id,
        tokenHash: refreshTokenHash,
        userAgent,
        expiresAt
    })

    const { password: _removed, ...safeUser } = user
    return { accessToken, refreshToken, user: safeUser }
}

const refreshTokens = async (rawRefreshToken) => {
    let payload;
    try {
        payload = jwt.verify(rawRefreshToken, env.JWT_REFRESH_SECRET);
    } catch (err) {
        throw new UnauthorizedError('Invalid refresh token');
    }

    const activeCandidates = await findRefreshTokensByUserId(payload.userId);

    const matchedHash = await findMatchingToken(rawRefreshToken, activeCandidates.map((c) => c.tokenHash));

    const matchedToken = activeCandidates.find((c) => c.tokenHash === matchedHash);

    if (!matchedToken) {

        const revokedCandidates = await findRevokedRefreshTokensByUserId(payload.userId);
        const reusedHash = await findMatchingToken(rawRefreshToken, revokedCandidates.map((c) => c.tokenHash));
        if (reusedHash) {
            await revokeAllUserRefreshTokens(payload.userId);
        }
        throw new UnauthorizedError('Invalid refresh token');
    }

    console.log('DEBUG: revoking token id', matchedToken.id);
    await revokeRefreshToken(matchedToken.id);
    console.log('DEBUG: revoke call completed');

    await revokeRefreshToken(matchedToken.id);

    const user = await findUserById(payload.userId);
    const newAccessToken = signAccessToken(user);
    const newRefreshToken = signRefreshToken(user);
    const newHash = await hashPassword(newRefreshToken);
    const expiresAt = new Date(Date.now() + ms(env.JWT_REFRESH_EXPIRATION));

    await createRefreshToken({
        userId: user.id,
        tokenHash: newHash,
        userAgent: matchedToken.userAgent,
        expiresAt,
    });

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
};

const logoutUser = async (rawRefreshToken) => {
    if (!rawRefreshToken) return;

    let payload;
    try {
        payload = jwt.verify(rawRefreshToken, env.JWT_REFRESH_SECRET);
    } catch (err) {
        return;
    }

    const activeCandidates = await findRefreshTokensByUserId(payload.userId);
    const matchedHash = await findMatchingToken(rawRefreshToken, activeCandidates.map((c) => c.tokenHash));
    const matchedToken = activeCandidates.find((c) => c.tokenHash === matchedHash);

    if (matchedToken) {
        await revokeRefreshToken(matchedToken.id);
    }
};

module.exports = {
    createNewUser,
    loginUser,
    refreshTokens,
    logoutUser
}
