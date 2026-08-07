const bcrypt = require('bcrypt');

const SALT_ROUNDS = 10;

async function hashPassword(password) {
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    return hashedPassword;
}

async function comparePassword(password, hashedPassword) {
    const isMatch = await bcrypt.compare(password, hashedPassword);
    return isMatch;
}

async function findMatchingToken(rawToken, hashes) {
    for (const hash of hashes) {
        if (await comparePassword(rawToken, hash)) {
            return hash;
        }
    }
    return null;
}

module.exports = {
    hashPassword,
    comparePassword,
    findMatchingToken
};