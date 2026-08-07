const express = require('express');

const router = express.Router();

const { getProfile, updateProfile } = require('../controllers/userController');
const authenticate = require('../middleware/authenticate');

const validate = require('../middleware/validate');
const { updateProfileSchema } = require('../validators/userValidator');

router.get('/me', authenticate, getProfile);
router.patch('/me', authenticate, validate(updateProfileSchema), updateProfile);

module.exports = router;