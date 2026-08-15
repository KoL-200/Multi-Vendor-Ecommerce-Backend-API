const { findCartWithItems } = require('../repositories/cartRepository')
const { checkout, findOrderById, findOrdersByCustomerId, updateOrderStatus, cancelOrderWithStockRestoration } = require('../repositories/orderRepository')

const { BadRequestError, NotFoundError, ForbiddenError } = require('../utils/AppError')

const checkoutCart = async (userId, shippingInfo) => {
    const cart = await findCartWithItems(userId)

    if (!cart || !cart.items || cart.items.length === 0) {
        throw new BadRequestError('Cart is empty')
    }

    for (const item of cart.items) {
        if (!item.product || !item.product.isActive) {
            throw new BadRequestError(`Product "${item.product?.name || 'Item'}" is no longer active`)
        }

        if (item.quantity > item.product.stock) {
            throw new BadRequestError(`Requested quantity for "${item.product.name}" exceeds available stock (${item.product.stock} available`)
        }
    }

    const totalAmount = cart.items.reduce((sum, item) => sum + item.quantity * item.product.price, 0)

    const order = await checkout(
        {
            userId,
            cartId: cart.id,
            items: cart.items,
            totalAmount,
            shippingInfo
        }
    )

    return order
}

const getMyOrders = async (userId) => {
    return await findOrdersByCustomerId(userId)
}

const getOrderById = async (orderId, userId, isAdmin) => {
    const order = await findOrderById(orderId)

    if (!order) {
        throw new NotFoundError('Order not found')
    }

    if (order.customerId !== userId && !isAdmin) {
        throw new NotFoundError("Order not found")
    }

    return order
}

const cancelOrder = async (orderId, userId, isAdmin) => {
    const order = await findOrderById(orderId)

    if (!order) {
        throw new NotFoundError('Order not found')
    }

    if (!isAdmin) {
        if (order.status === 'CANCELLED') {
            throw new BadRequestError('Order is already cancelled')
        }

        if (order.status === 'SHIPPED' || order.status === 'DELIVERED') {
            throw new BadRequestError(`Cannot cancel order once it has been ${order.status.toLowerCase()}`)
        }

    } else if (order.status === 'CANCELLED') {
        throw new BadRequestError('Order is already cancelled')
    }

    const updatedOrder = await cancelOrderWithStockRestoration(order.id)

    return updatedOrder
}

module.exports = {
    checkoutCart,
    getMyOrders,
    getOrderById,
    cancelOrder
}