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

   await User.updateOne(
    { phonenumber },
    {
      $set: {
        phoneOtp,
        phoneOtpExpires: expires
      }
    }
  );

  //Dev only: Log the OTP to the console
  console.log(`🔐 OTP sent to ${phonenumber}:`, phoneOtp); // ✅ Log the OTP here


  if (process.env.NODE_ENV === 'production') {
    // only send SMS in prod
    await twilioClient.messages.create({
      body: `Your verification code is ${phoneOtp}`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to:   phonenumber,
    });
  }


  //Dev only: Log the OTP to the console
  return phoneOtp;
}

// services/otp.service.js
async function checkPhoneOtp(phonenumber, providedOtp) {
  // fetch user so we can compare the stored OTP
  const user = await User.findOne({ phonenumber });
  if (!user) throw new Error('User not found.');

  // check match + expiry
  if (user.phoneOtp !== providedOtp || user.phoneOtpExpires < Date.now()) {
    throw new Error('Invalid or expired OTP');
  }

  // now atomically mark verified and clear OTP fields
  const result = await User.updateOne(
    { phonenumber },
    {
      $set:   { phoneVerified: true },
      $unset: { phoneOtp: "", phoneOtpExpires: "" }
    }
  );

  console.log('OTP verify updateOne result:', result);

  // re-fetch the updated user (or merge fields yourself)
  const verifiedUser = await User.findOne({ phonenumber });
  return verifiedUser;
}


module.exports = {
  sendEmailOtp, checkEmailOtp,
  sendPhoneOtp, checkPhoneOtp,
};
