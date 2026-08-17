const { findUserById, updateUser } = require('../repositories/userRepository');
const { findUsersByVendorStatus } = require('../repositories/vendorRepository');
const { NotFoundError, ConflictError, BadRequestError } = require('../utils/AppError');

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
    applyForVendor,
    getPendingApplications,
    approveVendor,
    rejectVendor,
    suspendVendor
}