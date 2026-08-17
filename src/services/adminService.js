const { countUsers, countVendors, countProducts, countOrders, revenueStats, bestSellers } = require('../repositories/adminRepository');
const { findProductsByIds } = require('../repositories/productRepository');
const { findUserById, updateUser } = require('../repositories/userRepository');
const { findUsersByVendorStatus } = require('../repositories/vendorRepository');
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

const applyForVendor = async (userId) => {
    const user = await findUserById(userId)

    if (!user) {
        throw new NotFoundError("User not found")
    }

    if (user.vendorStatus === 'PENDING') {
        throw new ConflictError('Your vendor application is under review')
    }

    if (user.vendorStatus === 'APPROVED') {
        throw new BadRequestError('You are already an approved vendor')
    }

    return await updateUser(userId, { vendorStatus: 'APPROVED' })
}

const getPendingApplications = async () => {
    return await findUsersByVendorStatus('PENDING')
}

const approveVendor = async (userId) => {
    const user = await findUserById(userId)

    if (!user) {
        throw new NotFoundError('User not found')
    }

    if (user.vendorStatus !== 'PENDING') {
        throw new BadRequestError(`Cannot approve user with current vendor status "${user.vendorStatus}"`)
    }

    return updateUser(userId, { vendorStatus: 'APPROVED' })
}

const rejectVendor = async (userId) => {
    const user = await findUserById(userId)

    if (!user) {
        throw new NotFoundError('User not found')
    }

    if (user.vendorStatus !== 'PENDING') {
        throw new BadRequestError(`Cannot reject application; status is "${user.vendorStatus}"`)
    }

    return updateUser(userId, { vendorStatus: 'REJECTED' })
}

const suspendVendor = async (userId) => {
    const user = await findUserById(userId)

    if (!user) {
        throw new NotFoundError('User not found')
    }

    if (user.vendorStatus !== 'PENDING') {
        throw new BadRequestError('Only currently APPROVED vendors can be suspended')
    }

    return updateUser(userId, { vendorStatus: 'REJECTED' })
}

module.exports = {
    getOverviewStats,
    getRevenueStats,
    getBestSellingProducts,
    applyForVendor,
    getPendingApplications,
    approveVendor,
    rejectVendor,
    suspendVendor
}