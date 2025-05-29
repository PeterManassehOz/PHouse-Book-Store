const express = require('express');
const {  resetUserPassword, forgotPassword, resetPasswordWithToken, registerUser, loginUser, verifyEmailOtp, resendEmailOtp, verifyPhoneOtp, resendPhoneOtp, forgotPHCode } = require('../controllers/auth.controller');

const router = express.Router();

router.post('/signup', registerUser);
router.post('/login', loginUser);
router.post('/verify-email-otp', verifyEmailOtp);
router.post('/resend-email-otp', resendEmailOtp);
router.post('/verify-phone-otp', verifyPhoneOtp);
router.post('/resend-phone-otp', resendPhoneOtp);
router.post('/reset-password', resetUserPassword);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPasswordWithToken);
router.post('/forgot-phcode', forgotPHCode);


module.exports = router;
