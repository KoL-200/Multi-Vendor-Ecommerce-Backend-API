const { prisma } = require('../src/config/database')

async function cleanDatabase() {
    await prisma.review.deleteMany()
    await prisma.orderItem.deleteMany()
    await prisma.order.deleteMany()
    await prisma.cartItem.deleteMany()
    await prisma.cart.deleteMany()
    await prisma.productImage.deleteMany()
    await prisma.product.deleteMany()
    await prisma.category.deleteMany()
    await prisma.store.deleteMany()
    await prisma.refreshToken.deleteMany()
    await prisma.user.deleteMany()
}

async function disconnectDatabase() {
    await prisma.$disconnect()
}

module.exports = { cleanDatabase, disconnectDatabase }