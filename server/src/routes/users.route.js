const express = require('express');
const { getUserProfile, updateUserProfile } = require('../controllers/users.controller');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, upload.single('image'), updateUserProfile);

module.exports = router;
