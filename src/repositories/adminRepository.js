const { prisma } = require('../config/database');

function countUsers() {
    return prisma.user.count();
}

function countVendors() {
    return prisma.user.count({ where: { vendorStatus: 'APPROVED' } });
}

function countProducts() {
    return prisma.product.count();
}

function countOrders() {
    return prisma.order.count();
}

function revenueStats() {
    return prisma.order.aggregate(
        {
            where: {
                status: {
                    in: [
                        'SHIPPED',
                        'DELIVERED'
                    ]
                }
            },
            _sum: {
                totalAmount: true
            }
        }
    )
}

function bestSellers() {
    return prisma.orderItem.groupBy(
        {
            by: ['productId'],
            where: {
                order: {
                    status: {
                        in: [
                            'SHIPPED',
                            'DELIVERED'
                        ]
                    }
                }
            },
            _sum: { quantity: true },
            orderBy: { _sum: { quantity: 'desc' } },
            take: 10,
        }
    )
}

module.exports = {
    countUsers,
    countVendors,
    countProducts,
    countOrders,
    revenueStats,
    bestSellers
};