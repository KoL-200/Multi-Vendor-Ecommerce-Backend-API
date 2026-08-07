const express = require('express');
const router = express.Router();

const validate = require('../middleware/validate');
const { registerSchema, loginSchema } = require('../validators/authValidator');

const { registerUser, loginExistingUser, refreshUserTokens, logoutExistingUser } = require('../controllers/authController');


const authenticate = require('../middleware/authenticate');

router.post('/register', validate(registerSchema), registerUser);
router.post('/login', validate(loginSchema), loginExistingUser);
router.post('/refresh', refreshUserTokens);
router.post('/logout', logoutExistingUser);

// router.get('/test-protected', authenticate, (req, res) => {
//     res.json({ message: 'You are authenticated', user: req.user });
// });


module.exports = router;