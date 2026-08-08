const { createNewStore, getAllStores, getStoreById, updateStore, deleteStore } = require('../services/storeService')

const newStore = async (req, res, next) => {
    const userId = req.user.userId

    const { name, description, phone, address } = req.body

    const store = await createNewStore({ userId, name, description, phone, address })

    res.status(201).json({ success: true, data: store })
}

const getStores = async (req, res) => {
    const stores = await getAllStores();
    res.status(200).json({ success: true, data: stores });
};

const getStore = async (req, res) => {
    const { id } = req.params;
    const store = await getStoreById(id);
    res.status(200).json({ success: true, data: store });
};

const updatedStore = async (req, res, next) => {
    const { id } = req.params
    const { userId, isAdmin } = req.user

    const { name, description, phone, address } = req.body

    const storeUpdate = await updateStore({
        storeId: id,
        userId,
        isAdmin,
        data: { name, description, phone, address },
    })

    res.status(200).json({ success: true, data: storeUpdate })
}

const deletedStore = async (req, res, next) => {
    const { id } = req.params
    const { isAdmin } = req.user

    const result = await deleteStore({ storeId: id, isAdmin })

    res.status(200).json({ success: true, message: result.message })
}

module.exports = {
    newStore,
    getStores,
    getStore,
    updatedStore,
    deletedStore
}