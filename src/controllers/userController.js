const { getMyProfile, updateMyProfile } = require('../services/userService')

const getProfile = async (req, res, next) => {
    const userId = req.user.userId;
    const userProfile = await getMyProfile(userId);
    res.status(200).json({ success: true, data: userProfile });
}

const updateProfile = async (req, res, next) => {
    const userId = req.user.userId;
    const { name } = req.body;
    const updatedProfile = await updateMyProfile(userId, { name });
    res.status(200).json({ success: true, data: updatedProfile });
}

module.exports = { getProfile, updateProfile };