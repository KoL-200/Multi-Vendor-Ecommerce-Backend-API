const { createNewUser, loginUser } = require('../services/authService');

const registerUser = async (req, res, next) => {
    const { email, password, name } = req.body;
    const newUser = await createNewUser({ email, password, name });
    res.status(201).json({ success: true, data: newUser });
};

const loginExistingUser = async (req, res, next) => {
    const { email, password } = req.body;
    const userAgent = req.headers['user-agent'];
    const { accessToken, refreshToken, user } = await loginUser({ email, password, userAgent });
    res.status(200).json({ success: true, data: { accessToken, refreshToken, user } });
}

module.exports = {
    registerUser,
    loginExistingUser
}; 