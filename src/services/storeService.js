const { createStore, findStoreByOwnerId, findStoreById, findAllActiveStores, updateStoreById, deleteStoreByid } = require('../repositories/storeRepository');
const { findUserById } = require('../repositories/userRepository');

const { ForbiddenError, ConflictError, NotFoundError } = require('../utils/AppError')

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

const getAllStores = async () => {
    return findAllActiveStores();
};

const getStoreById = async (storeId) => {
    const store = await findStoreById(storeId);
    if (!store || !store.isActive) {
        throw new NotFoundError('Store not found');
    }
    return store;
};

const updateStore = async ({ storeId, userId, isAdmin, data }) => {
    const store = await findStoreById(storeId)

    if (!store) {
        throw new NotFoundError("Store not found")
    }

    if (store.ownerId !== userId && !isAdmin) {
        throw new ForbiddenError("Can not perfrom this command")
    }

    return updateStoreById(storeId, data)
}

const deleteStore = async ({ storeId, isAdmin }) => {
    if (!isAdmin) {
        throw new ForbiddenError("You can't perform this operation")
    }

    const store = await findStoreById(storeId)

    if (!store) {
        throw new NotFoundError("Store not found")
    }

    await deleteStoreByid(storeId, isAdmin)

    return {
        status: 200,
        message: "Store deleted successfully"
    }
}

module.exports = {
    createNewStore,
    getAllStores,
    getStoreById,
    updateStore,
    deleteStore
}