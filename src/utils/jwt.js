const jwt = require('jsonwebtoken');

const env = require('../config/env');

const crypto = require('crypto');


function signToken(payload, secret, expiresIn) {
    return jwt.sign(payload, secret, { expiresIn });
}

function signAccessToken(user) {
    return signToken({ userId: user.id, roles: user.roles, isAdmin: user.isAdmin }, env.JWT_ACCESS_SECRET, env.JWT_ACCESS_EXPIRATION);
}

function signRefreshToken(user) {
    return signToken(
        { userId: user.id, jti: crypto.randomUUID() },
        env.JWT_REFRESH_SECRET,
        env.JWT_REFRESH_EXPIRATION
    );
}

module.exports = {
    signAccessToken,
    signRefreshToken,
};