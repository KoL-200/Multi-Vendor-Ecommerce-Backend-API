const { findUserById, updateUser } = require('../repositories/userRepository');
const { NotFoundError } = require('../utils/AppError');

const getMyProfile = async (userId) => {
    const user = await findUserById(userId);
    if (!user) {
        throw new NotFoundError('User not found');
    }
    const { password: _removed, ...safeUser } = user;
    return safeUser;
}

const updateMyProfile = async (userId, data) => {
    const user = await findUserById(userId);
    if (!user) {
        throw new NotFoundError('User not found');
    }
    const updatedUser = await updateUser(userId, data);
    const { password: _removed, ...safeUser } = updatedUser;
    return safeUser;
}

module.exports = {
    getMyProfile,
    updateMyProfile
};