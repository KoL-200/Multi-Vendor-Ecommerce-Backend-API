const { prisma } = require('../config/database')

function findUsersByVendorStatus(vendorStatus) {
    return prisma.user.findMany(
        {
            where: {
                vendorStatus
            },
            select: {
                id: true,
                email: true,
                name: true,
                vendorStatus: true,
                createdAt: true
            }
        }
    )
}

module.exports = {
    findUsersByVendorStatus
}