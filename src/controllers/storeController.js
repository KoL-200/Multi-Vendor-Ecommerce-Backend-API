const { createNewStore } = require('../services/storeService')

const newStore = async (req, res, next) => {
    const userId = req.user.userId

    const { name, description, phone, address } = req.body

    const store = await createNewStore({ userId, name, description, phone, address })

    res.status(201).json({ success: true, data: store })
}

module.exports = {
    newStore
}