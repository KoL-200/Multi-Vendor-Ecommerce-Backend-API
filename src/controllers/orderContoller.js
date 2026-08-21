const { checkoutCart, getMyOrders, getOrderById, cancelOrder } = require('../services/orderService')

const checkout = async (req, res, next) => {
    const userId = req.user.userId
    const shippingInfo = req.body
    const checkoutResult = await checkoutCart(userId, shippingInfo)
    res.status(201).json({ success: true, data: checkoutResult })
}

const myOrders = async (req, res, next) => {
    const userId = req.user.userId
    const myordersResult = await getMyOrders(userId)
    res.status(200).json({ success: true, data: myordersResult })
}

const myOrder = async (req, res, next) => {
    const { id } = req.params
    const { userId, isAdmin } = req.user
    const myOrderResult = await getOrderById(id, userId, isAdmin)
    res.status(200).json({ success: true, data: myOrderResult })
}

const updatedOrderStatus = async (req, res, next) => {
    const { id } = req.params
    const { userId, isAdmin } = req.user
    const result = await cancelOrder(id, userId, isAdmin)
    res.status(200).json({ success: true, data: result })
}

module.exports = {
    checkout,
    myOrders,
    myOrder,
    updatedOrderStatus
}