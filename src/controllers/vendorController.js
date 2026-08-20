const { applyForVendor, getPendingApplications, approveVendor, rejectVendor, suspendVendor } = require('../services/vendorService')

const apply = async (req, res) => {
    const userId = req.user.userId
    const updateUser = await applyForVendor(userId)

    res.status(200).json(
        {
            success: true,
            message: 'Vendor application submitted successfully',
            data: { vendorStatus: updateUser.vendorStatus }
        }
    )
}

const listPendingApplications = async (req, res) => {
    const applications = await getPendingApplications()

    res.status(200).json({ success: true, data: applications })
}

const approve = async (req, res) => {
    const { userId } = req.params
    const user = await approveVendor(userId)

    res.status(200).json(
        {
            success: true,
            message: 'Vendor approved',
            data: user
        }
    )
}

const reject = async (req, res) => {
    const { userId } = req.params
    const user = await rejectVendor(userId)

    res.status(200).json(
        {
            success: true,
            message: 'Vendor application rejected',
            data: user
        }
    )
}

const suspend = async (req, res) => {
    const { userId } = req.params
    const user = await suspendVendor(userId)

    res.status(200).json(
        {
            success: true,
            message: 'Vendor suspended',
            data: user
        }
    )
}

module.exports = {
    apply,
    listPendingApplications,
    approve,
    reject,
    suspend
}