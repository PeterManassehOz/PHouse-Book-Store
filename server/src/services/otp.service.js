const User = require('../models/users.model');
const { generateOTP, hashOtp, verifyOtp } = require('../utils/otp');
const transporter = require('../config/nodemailer'); // however you've configured this

/**
 * Send an OTP to the user’s email and store its hash + expiry on the user record.
 */
async function sendOtp(email) {
  const otpPlain = generateOTP(6);
  const otpHash  = await hashOtp(otpPlain);
  const expires  = Date.now() + 10 * 60 * 1000; // 10m

  const user = await User.findOne({ email });
  if (!user) throw new Error('User not found.');

  user.otp        = otpHash;
  user.otpExpires = new Date(expires);
  await user.save();

  await transporter.sendMail({
    to: email,
    subject: 'Your verification code',
    text: `Your one‐time code is ${otpPlain}. It expires in 10 minutes.`,
  });
}

/**
 * Verify the OTP the user supplied.
 */
async function checkOtp(email, plainOtp) {
  const user = await User.findOne({ email });
  if (!user) throw new Error('User not found.');
  if (!user.otp || user.otpExpires < Date.now()) throw new Error('OTP expired');
  const valid = await verifyOtp(plainOtp, user.otp);
  if (!valid) throw new Error('Invalid OTP');
  // mark verified
  user.emailVerified = true;
  user.otp = undefined;
  user.otpExpires = undefined;
  await user.save();
  return user;
}

module.exports = { sendOtp, checkOtp };
