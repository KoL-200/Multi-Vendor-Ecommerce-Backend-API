const { prisma } = require('../config/database')

async function checkout({ userId, cartId, items, totalAmount, shippingInfo }) {
    return prisma.$transaction(async (tx) => {
        const order = await tx.order.create({
            data: { customerId: userId, totalAmount, status: 'PENDING_PAYMENT', ...shippingInfo },
        });

        for (const item of items) {
            await tx.orderItem.create({
                data: {
                    orderId: order.id,
                    productId: item.productId,
                    quantity: item.quantity,
                    priceAtPurchase: item.product.price,
                },
            });

            await tx.product.update({
                where: { id: item.productId },
                data: { stock: { decrement: item.quantity } },
            });
        }

        await tx.cartItem.deleteMany({ where: { cartId } });

        return order;
    });
}

function findOrdersByCustomerId(customerId) {
    return prisma.order.findMany(
        {
            where: {
                customerId
            }
        }
    )
}

function findOrderById(id) {
    return prisma.order.findUnique(
        {
            where: {
                id
            }
        }
    )
}

function updateOrderStatus(id, status) {
    return prisma.order.update(
        {
            where: {
                id
            },
            data: {
                status
            }
        }
    )
}

async function cancelOrderWithStockRestoration(orderId) {
    return prisma.$transaction(async (tx) => {
        const items = await tx.orderItem.findMany({
            where: { orderId }
        });

        for (const item of items) {
            await tx.product.update({
                where: { id: item.productId },
                data: { stock: { increment: item.quantity } }
            });
        }

        return tx.order.update({
            where: { id: orderId },
            data: { status: 'CANCELLED' },
            include: { items: true }
        });
    });
}

module.exports = {
    checkout,
    findOrdersByCustomerId,
    findOrderById,
    updateOrderStatus,
    cancelOrderWithStockRestoration
}