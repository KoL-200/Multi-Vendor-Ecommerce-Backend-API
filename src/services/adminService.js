const { countUsers, countVendors, countProducts, countOrders, revenueStats, bestSellers } = require('../repositories/adminRepository');
const { findProductsByIds } = require('../repositories/productRepository');
const { NotFoundError, ConflictError, BadRequestError } = require('../utils/AppError');

const getOverviewStats = async () => {
    const [totalUsers, totalVendors, totalProducts, totalOrders] = await Promise.all([
        countUsers(),
        countVendors(),
        countProducts(),
        countOrders(),
    ]);

    return {
        totalUsers,
        totalVendors,
        totalProducts,
        totalOrders
    }
}

const getRevenueStats = async () => {
    const result = await revenueStats()
    const totalRevenue = result._sum.totalAmount || 0
    return { totalRevenue }
}
const getBestSellingProducts = async (limit = 4) => {
    const topGroups = await bestSellers(limit)

    if (topGroups.length === 0) {
        return []
    }

    const productIds = topGroups.map(group => group.productId)

    const products = await findProductsByIds(productIds)

    const productMap = new Map(products.map(p => [p.id, p]))

    return topGroups.map(group => {
        const product = productMap.get(group.productId)
        return {
            productId: group.productId,
            name: product ? product.name : 'Unknown Product',
            price: product ? product.price : 0,
            totalSold: group._sum.quantity || 0
        }
    })
}

module.exports = {
    getOverviewStats,
    getRevenueStats,
    getBestSellingProducts
}