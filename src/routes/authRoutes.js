const express = require('express');
const router = express.Router();

const validate = require('../middleware/validate');
const { registerSchema, loginSchema } = require('../validators/authValidator');

const { registerUser, loginExistingUser, refreshUserTokens, logoutExistingUser } = require('../controllers/authController');

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password, name]
 *             properties:
 *               email: { type: string, format: email }
 *               password: { type: string, minLength: 8 }
 *               name: { type: string }
 *     responses:
 *       201:
 *         description: User created
 *       409:
 *         description: Email already registered
 *       400:
 *         description: Validation error
 */
router.post('/register', validate(registerSchema), registerUser);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login an existing user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, format: email }
 *               password: { type: string, minLength: 8 }
 *     responses:
 *       200:
 *         description: User logged in
 *       401:
 *         description: Invalid credentials
 *       400:
 *         description: Validation error
 */
router.post('/login', validate(loginSchema), loginExistingUser);

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: Refresh access and refresh tokens
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refreshToken]
 *             properties:
 *               refreshToken: { type: string }
 *     responses:
 *       200:
 *         description: Tokens refreshed
 *       401:
 *         description: Invalid refresh token
 *       400:
 *         description: Validation error
 */
router.post('/refresh', refreshUserTokens);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout an existing user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refreshToken]
 *             properties:
 *               refreshToken: { type: string }
 *     responses:
 *       200:
 *         description: User logged out
 *       401:
 *         description: Unauthorized
 *       400:
 *         description: Validation error
 */
router.post('/logout', logoutExistingUser);

module.exports = router;