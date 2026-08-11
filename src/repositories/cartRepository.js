const { prisma } = require('../config/database')

function findCartByUserId(userId) {
    return prisma.cart.findUnique(
        {
            where: {
                userId
            }
        }
    )
}

function createCart(userId) {
    return prisma.cart.create(
        {
            data: { userId }
        }
    )
}

function findCartItem(cartId, productId) {
    return prisma.cartItem.findUnique(
        {
            where: {
                cartId_productId: {
                    cartId,
                    productId
                }
            }
        }
    )
}

function findCartItemById(id) {
    return prisma.cartItem.findUnique(
        {
            where: {
                id
            },
            include: {
                cart: true,
                product: true
            },
        }
    )
}

function createCartItem({ cartId, productId, quantity }) {
    return prisma.cartItem.create(
        {
            data: {
                cartId,
                productId,
                quantity
            }
        }
    )
}

function findCartWithItems(userId) {
    return prisma.cart.findUnique({
        where: { userId },
        include: {
            items: {
                include: { product: true },
            },
        },
    })
}

function updateCartItem(id, quantity) {
    return prisma.cartItem.update(
        {
            where: {
                id,
            },
            data: {
                quantity
            }
        }
    )
}

function deleteCartItem(id) {
    return prisma.cartItem.delete(
        {
            where: {
                id: id
            }
        }
    )
}

module.exports = {
    findCartByUserId,
    createCart,
    findCartItem,
    findCartItemById,
    createCartItem,
    findCartWithItems,
    updateCartItem,
    deleteCartItem
}