const express = require('express');
const { registerUser, loginUser, resetUserPassword, forgotPassword, resetPasswordWithToken  } = require('../controllers/auth.controller');

const router = express.Router();

router.post('/signup', registerUser);
router.post('/login', loginUser);
router.post('/reset-password', resetUserPassword);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPasswordWithToken);


module.exports = router;
