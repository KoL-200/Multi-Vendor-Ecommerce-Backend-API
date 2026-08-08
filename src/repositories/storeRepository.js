const { prisma } = require('../config/database');

function createStore({ ownerId, name, description, phone, address }) {
    return prisma.store.create({
        data: {
            ownerId,
            name,
            description,
            phone,
            address
        }
    });
}

function findStoreByOwnerId(ownerId) {
    return prisma.store.findUnique({
        where: { ownerId }
    });
}

function findStoreById(storeId) {
    return prisma.store.findUnique({
        where: { id: storeId }
    });
}

function findAllActiveStores() {
    return prisma.store.findMany({ where: { isActive: true } });
}

function updateStoreById(id, data) {
    return prisma.store.update(
        {
            where: { id },
            data
        }
    )
}

function deleteStoreByid(id) {
    return prisma.store.delete(
        {
            where: { id }
        }
    )
}

module.exports = {
    createStore,
    findStoreByOwnerId,
    findStoreById,
    findAllActiveStores,
    updateStoreById,
    deleteStoreByid
};