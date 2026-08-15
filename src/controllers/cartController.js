const { getCart, addItemToCart, updateCartItemQuantity, removeCartItem } = require('../services/cartService')

const getItenFromCart = async (req, res, next) => {
    const userId = req.user.userId
    const result = await getCart(userId)
    res.status(200).json({ success: true, data: result })
}

const addToCart = async (req, res) => {
    const userId = req.user.userId
    const result = await addItemToCart(userId, req.body)
    res.status(200).json({ success: true, data: result })
};

const updateItemFromCart = async (req, res) => {
    const userId = req.user.userId
    const { id } = req.params
    const { quantity } = req.body
    const result = await updateCartItemQuantity(userId, id, quantity)
    res.status(200).json({ success: true, data: result })
};

const deleteItemFromCart = async (req, res, next) => {
    const userId = req.user.userId
    const { id } = req.params
    await removeCartItem(userId, id);
    res.status(200).json({ success: true, message: 'Item deleted from cart successfully' })
}

module.exports = {
    getItenFromCart,
    addToCart,
    updateItemFromCart,
    deleteItemFromCart
}