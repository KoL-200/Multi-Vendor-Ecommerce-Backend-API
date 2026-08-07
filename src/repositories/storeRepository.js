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

module.exports = {
    createStore,
    findStoreByOwnerId,
    findStoreById
};