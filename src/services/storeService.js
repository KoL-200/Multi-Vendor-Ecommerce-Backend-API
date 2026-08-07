const { createStore, findStoreByOwnerId, findStoreById } = require('../repositories/storeRepository');
const { findUserById } = require('../repositories/userRepository');

const { ForbiddenError, ConflictError } = require('../utils/AppError')

const createNewStore = async ({ userId, name, description, phone, address }) => {
    const user = await findUserById(userId)

    if (user.vendorStatus !== 'APPROVED') {
        throw new ForbiddenError("You can't create a store")
    }

    const existingStore = await findStoreByOwnerId(userId)

    if (existingStore) {
        throw new Conflict('You already own a store')
    }

    return createStore(
        {
            ownerId: userId,
            name,
            description,
            phone,
            address
        }
    )
}

module.exports = {
    createNewStore
}