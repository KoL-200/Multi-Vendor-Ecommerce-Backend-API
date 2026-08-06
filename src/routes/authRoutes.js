const express = require('express');
const router = express.Router();

const validate = require('../middleware/validate');
const { registerSchema, loginSchema } = require('../validators/authValidator');

const { registerUser, loginExistingUser } = require('../controllers/authController');

router.post('/register', validate(registerSchema), registerUser);
router.post('/login', validate(loginSchema), loginExistingUser);

module.exports = router;