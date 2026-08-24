const bcrypt = require('bcrypt');
const crypto = require('crypto');

const SALT_ROUNDS = 10;

async function hashPassword(password) {
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    return hashedPassword;
}

async function comparePassword(password, hashedPassword) {
    const isMatch = await bcrypt.compare(password, hashedPassword);
    return isMatch;
}

function hashToken(rawToken) {
    return crypto.createHash('sha256').update(rawToken).digest('hex');
}

function findMatchingToken(rawToken, hashes) {
    const rawHash = hashToken(rawToken);
    return hashes.find((h) => h === rawHash) ?? null;
}

module.exports = {
    hashPassword,
    comparePassword,
    hashToken,
    findMatchingToken
};