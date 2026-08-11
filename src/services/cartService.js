const { findCartByUserId, createCart, findCartItem, updateCartItem, createCartItem, findCartWithItems, findCartItemById, deleteCartItem } = require('../repositories/cartRepository')
const { findProductById } = require('../repositories/productRepository')

const { BadRequestError, NotFoundError } = require('../utils/AppError')


async function getCart(userId) {
    const cart = await findCartWithItems(userId)

    if (!cart) {
        return { items: [], total: 0 }
    }

    const total = cart.items.reduce((sum, item) => sum + item.quantity * item.product.price, 0)
    return { items: cart.items, total }
}

async function addItemToCart(userId, { productId, quantity }) {
    const product = await findProductById(productId)

    if (!product) {
        throw new NotFoundError("Product not found")
    }

    if (!product.isActive) {
        throw new BadRequestError("No active products available")
    }

    let cart = await findCartByUserId(userId)

    if (!cart) {
        cart = await createCart(userId)
    }

    const existingCartItem = await findCartItem(cart.id, productId)
    const currentQuantity = existingCartItem ? existingCartItem.quantity : 0
    const newQuantity = currentQuantity + quantity

    if (newQuantity > product.stock) {
        throw new BadRequestError(`Requested quantity exceeds available stock (${product.stock} available)`)
    }

    if (existingCartItem) {
        await updateCartItem(existingCartItem.id, newQuantity)
    } else {
        await createCartItem(
            {
                cartId: cart.id,
                productId,
                quantity: newQuantity
            }
        )
    }

    return await getCart(userId)
}

async function updateCartItemQuantity(userId, id, quantity) {
    const cartItem = await findCartItemById(id)

    if (!cartItem) {
        throw new NotFoundError('Cart item not found');
    }

    if (cartItem.cart?.userId !== userId) {
        throw new NotFoundError("Cart item not found")
    }

    if (quantity > cartItem.product.stock) {
        throw new BadRequestError(`Requested quantity exceeds available stock (${cart.product.stock} available)`)
    }

    await updateCartItem(id, quantity)

    return getCart(userId)
}

async function removeCartItem(userId, id) {
    const cartItem = await findCartItemById(id)

    if (!cartItem) {
        throw new NotFoundError('Cart item not found');
    }

    if (cartItem.cart?.userId !== userId) {
        throw new NotFoundError("Cart item not found")
    }

    await deleteCartItem(id)

    return getCart(userId)
}

module.exports = {
    getCart,
    addItemToCart,
    updateCartItemQuantity,
    removeCartItem
}