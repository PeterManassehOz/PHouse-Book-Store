const express = require('express');
const {  resetUserPassword, forgotPassword, resetPasswordWithToken, registerUser, loginUser, verifyOtp, resendOtp  } = require('../controllers/auth.controller');

const router = express.Router();

router.post('/signup', registerUser);
router.post('/login', loginUser);
router.post('/verify-otp', verifyOtp);
router.post('/resend-otp', resendOtp);
router.post('/reset-password', resetUserPassword);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPasswordWithToken);


module.exports = router;
