// services/otp.service.js
const User = require('../models/users.model');
const { generateOTP, hashOtp, verifyOtp } = require('../utils/otp');
const transporter = require('../config/nodemailer');
const twilio = require('twilio');
const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// — EMAIL OTP — 
async function sendEmailOtp(email) {
  const otpPlain = generateOTP(6);
  const otpHash  = await hashOtp(otpPlain);
  const expires  = Date.now() + 10 * 60 * 1000; // 10m

  const user = await User.findOne({ email });
  if (!user) throw new Error('User not found.');

  user.emailOtp        = otpHash;
  user.emailOtpExpires = new Date(expires);
  await user.save();

  await transporter.sendMail({
    to: email,
    subject: 'Your verification code',
    text: `Your one-time code is ${otpPlain}. It expires in 10 minutes.`,
  });
}

async function checkEmailOtp(email, emailOtp) {
  const user = await User.findOne({ email });
  if (!user) throw new Error('User not found.');
  if (!user.emailOtp || user.emailOtpExpires < Date.now()) throw new Error('OTP expired');

  const valid = await verifyOtp(emailOtp, user.emailOtp);
  if (!valid) throw new Error('Invalid OTP');

  user.emailVerified     = true;
  user.emailOtp          = undefined;
  user.emailOtpExpires   = undefined;
  await user.save();
  return user;
}

// — PHONE OTP (Twilio) —
function generatePhoneOtp() {
  return (Math.floor(100000 + Math.random() * 900000)).toString();
}

async function sendPhoneOtp(phonenumber) {
  const phoneOtp = generatePhoneOtp();
  const expires = new Date(Date.now() + 10 * 60 * 1000); // 10m

  const user = await User.findOne({ phonenumber });
  if (!user) throw new Error('User not found.');

  user.phoneOtp        = phoneOtp;
  user.phoneOtpExpires = expires;
  await user.save();

  //Dev only: Log the OTP to the console
  console.log(`🔐 OTP sent to ${phonenumber}:`, phoneOtp); // ✅ Log the OTP here


  await twilioClient.messages.create({
    body: `Your verification code is ${phoneOtp}`,
    from: process.env.TWILIO_PHONE_NUMBER,
    to: phonenumber,
  });

  //Dev only: Log the OTP to the console
  return phoneOtp;
}

async function checkPhoneOtp(phonenumber, phoneOtp) {
  const user = await User.findOne({ phonenumber });
  if (!user) throw new Error('User not found.');
  if (user.phoneOtp !== phoneOtp || user.phoneOtpExpires < Date.now()) {
    throw new Error('Invalid or expired OTP');
  }

  user.phoneVerified   = true;
  user.phoneOtp        = undefined;
  user.phoneOtpExpires = undefined;
  await user.save();
  return user;
}

module.exports = {
  sendEmailOtp, checkEmailOtp,
  sendPhoneOtp, checkPhoneOtp,
};
