const { generateTokenPassword, verifyPasswordAndGenerateToken } = require('../utils/generateTokenPassword');
const User = require('../models/users.model');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { sendEmailOtp, checkEmailOtp, sendPhoneOtp, checkPhoneOtp } = require("../services/otp.service");
const STATES = require('../lib/states'); 



const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true, // Use `true` for port 465, `false` for 587
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});



const registerUser = async (req, res) => {
  try {
    const { firstname, lastname, email, phonenumber, gender, stateCode, password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

        // 2) Validate stateCode & get full name
    if (!/^[A-Z]{2,3}$/.test(stateCode) || !STATES[stateCode]) {
      return res.status(400).json({ message: "Invalid state code" });
    }
    const state = STATES[stateCode];

    // 3) gender must be 'M' or 'F'
    if (!['M','F'].includes(gender)) {
      return res.status(400).json({ message: "Gender must be 'M' or 'F'" });
    }

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "Email already in use" });


     // ————————————————
    // PHCode generation exactly as in A:
    const yearSuffix = new Date().getFullYear().toString().slice(-2);           // e.g. "24"
    const prefix = `${stateCode}${yearSuffix}-${gender}`;                       // e.g. "LAG24-M"
    
    const similarCount = await User.countDocuments({
      phcode: { $regex: `^${prefix}` }
    });
    const sequence = String(similarCount + 1).padStart(4, '0');                 // e.g. "0001"
    const phcode = `${prefix}${sequence}`;                                      // e.g. "LAG24-M0001"
    // ————————————————

    const user = new User({
      firstname,
      lastname,
      email,
      phonenumber,
      gender,
      stateCode,
      state: state,
      phcode,
      emailVerified: false,
      phoneVerified: false,
    });

    const { hashedPassword } = await generateTokenPassword(user, password);
    user.password = hashedPassword;
    await user.save();

    res.status(201).json({
      message: "Registered! Now choose how you’d like to be verified.",
      needsVerification: true,
      nextStep: "choose",
      email: user.email,
      phonenumber: user.phonenumber,
      phcode: user.phcode
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};





const loginUser = async (req, res) => {
  try {
    const { phcode, password } = req.body;

    const user = await User.findOne({ phcode: phcode.toUpperCase() });
    if (!user) return res.status(400).json({ message: "Invalid phcode or password" });

    await verifyPasswordAndGenerateToken(user, password);

    // 🔁 Check verification status
    const isEmailVerified = user.emailVerified;
    const isPhoneVerified = user.phoneVerified;

    if (isEmailVerified && isPhoneVerified) {
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });
      return res.status(200).json({ token, user });
    }

    // 🚦 At least one verification is pending
    let nextStep = "verify";

    if (!isEmailVerified && !isPhoneVerified) {
      nextStep = "choose"; // Ask user which method they prefer to verify
    } else if (!isPhoneVerified) {
      await sendPhoneOtp(user.phonenumber);
      nextStep = "verify-phone";
    } else if (!isEmailVerified) {
      await sendEmailOtp(user.email);
      nextStep = "verify-email";
    }

    return res.status(200).json({
      message: "Verification required",
      email: user.email,
      phonenumber: user.phonenumber,
      needsVerification: true,
      nextStep, // 👈 can be 'verify-email', 'verify-phone', or 'choose'
      user
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};




// =========================
// Verify Email OTP
// =========================
const verifyEmailOtp = async (req, res) => {
  const { email, emailOtp } = req.body;
  try {
    const user = await checkEmailOtp(email, emailOtp);
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });
    res.status(200).json({ message: "Email verified!", token, user });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// =========================
// Resend Email OTP
// =========================
const resendEmailOtp = async (req, res) => {
  try {
    console.log("resendEmailOtp body:", req.body);

    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    await sendEmailOtp(email);
    res.status(200).json({ message: "OTP sent to email." });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};


const verifyPhoneOtp = async (req, res) => {
  const { phonenumber, phoneOtp } = req.body;
  console.log("Verifying phone OTP:", { phonenumber, phoneOtp });
  try {
    const user = await checkPhoneOtp(phonenumber, phoneOtp);
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });

    res.status(200).json({ message: "Phone number verified!", token, user });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};


// Uncomment for production mode
/*const resendPhoneOtp = async (req, res) => {
  try {
    const { phonenumber } = req.body;
    if (!phonenumber) return res.status(400).json({ message: "Phone number is required" });

    const user = await User.findOne({ phonenumber });
    if (!user) return res.status(404).json({ message: "User not found" });

    await sendPhoneOtp(phonenumber);

    res.status(200).json({ message: "OTP sent to phone number."}); 
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
*/


//Dev only
const resendPhoneOtp = async (req, res) => {
  try {
    const { phonenumber } = req.body;
    if (!phonenumber) return res.status(400).json({ message: "Phone number is required" });

    const user = await User.findOne({ phonenumber });
    if (!user) return res.status(404).json({ message: "User not found" });

    //await sendPhoneOtp(phonenumber);

    const phoneOtp = await sendPhoneOtp(phonenumber); // Send OTP and log it
    res.status(200).json({ message: "OTP sent to phone number.", phoneOtp }); // Include OTP in the response for logging purposes
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};




const resetUserPassword = async (req, res) => {
    try {
        const { phcode, password, confirmPassword } = req.body;
        if (password !== confirmPassword) {
            return res.status(400).json({ message: "Passwords do not match" });
        }

        const user = await User.findOne({ phcode });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const { hashedPassword } = await generateTokenPassword(user, password);
        user.password = hashedPassword;
        await user.save();

        res.status(200).json({ message: "Password reset successfully" });
 
    } catch (error) {
        return res.status(500).json({ message: "Server Error" });
    }
};



// 🔹 Request Password Reset (Generate Token)
const forgotPassword = async (req, res) => {
    try {
      const { email } = req.body;
      const user = await User.findOne({ email });
  
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      // Generate Reset Token
      const resetToken = crypto.randomBytes(32).toString("hex");
      const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex"); // Hash the token
      const resetTokenExpires = Date.now() + 3600000; // Token expires in 1 hour
  
      // Store token in user model
      user.resetToken = hashedToken;
      user.resetTokenExpires = resetTokenExpires;
      await user.save();
  
      // Send email with reset link
      const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: "Password Reset Request",
        html: `
          <p>You requested a password reset.</p>
          <p>Click the link below to reset your password:</p>
          <a href="${resetUrl}">${resetUrl}</a>
          <p>This link is valid for 1 hour.</p>
        `,
      };
  
      await transporter.sendMail(mailOptions);
      return res.status(200).json({ message: "Password reset email sent" });
    } catch (error) {
      console.error("Forgot Password Error:", error);
      return res.status(500).json({ message: "Server Error" });
    }
  };

// 🔹 Reset Password Using Token
const resetPasswordWithToken = async (req, res) => {
  try {
    const { password, confirmPassword } = req.body;
    const { token } = req.params; // Extract token from URL

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    // Hash the token before searching in DB
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // Find user with valid reset token
    const user = await User.findOne({
      resetToken: hashedToken,
      resetTokenExpires: { $gt: Date.now() }, // Check if token is still valid
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    // Clear reset token fields
    user.resetToken = null;
    user.resetTokenExpires = null;
    await user.save();

    return res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    console.error("Reset Password Error:", error);
    return res.status(500).json({ message: "Server Error" });
  }
};



const forgotPHCode = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User with this email does not exist' });

    const mailOptions = {
      from: process.env.EMAIL_USER, // Make sure this is set in your .env
      to: user.email,
      subject: 'Your PHCode',
      text: `Hello ${user.firstname},\n\nYour PHCode is: ${user.phcode}\n\nPlease keep it secure.`,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: 'PHCode has been sent to your email' });
  } catch (err) {
    console.error('Error sending PHCode email:', err);
    res.status(500).json({ message: 'Failed to send PHCode. Please try again later.' });
  }
};

module.exports = { registerUser, loginUser, verifyEmailOtp, resendEmailOtp, verifyPhoneOtp, resendPhoneOtp, resetUserPassword, forgotPassword, resetPasswordWithToken, forgotPHCode };
