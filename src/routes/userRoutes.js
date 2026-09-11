const express = require('express');

const router = express.Router();

const { getProfile, updateProfile } = require('../controllers/userController');
const authenticate = require('../middleware/authenticate');

const validate = require('../middleware/validate');
const { updateProfileSchema } = require('../validators/userValidator');

/**
 * @swagger
 * /users/me:
 *   get:
 *     summary: Get the authenticated user's profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile
 *       401:
 *         description: Missing or invalid token
 */
router.get('/me', authenticate, getProfile);

/**
 * @swagger
 * /users/me:
 *   patch:
 *     summary: Update the authenticated user's profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name: { type: string, minLength: 1 }
 *     responses:
 *       200:
 *         description: User profile updated
 *       401:
 *         description: Missing or invalid token
 *       400:
 *         description: Validation error
 */
router.patch('/me', authenticate, validate(updateProfileSchema), updateProfile);

module.exports = router;