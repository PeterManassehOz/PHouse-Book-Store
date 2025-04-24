const { generateTokenPassword, verifyPasswordAndGenerateToken } = require('../utils/generateTokenPassword');
const User = require('../models/users.model');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { sendOtp, checkOtp } = require("../services/otp.service");



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
    const { firstname, lastname, email, phcode, state, password, confirmPassword } = req.body;
    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "Email in use" });

    // hash & store password
    const user = new User({ firstname, lastname, email, phcode, state, emailVerified: false });
    const { hashedPassword } = await generateTokenPassword(user, password);
    user.password = hashedPassword;
    await user.save();

    // now send OTP
    await sendOtp(email);

    // client must next call /auth/verify-otp
    res.status(201).json({
      message: "Registered! Check your email for a one-time code.",
      email,
      needsVerification: true,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};



const loginUser = async (req, res) => {
  try {
    const { phcode, password } = req.body;
    const user = await User.findOne({ phcode });
    if (!user) return res.status(400).json({ message: "Invalid phcode or password" });

    // verify password
    await verifyPasswordAndGenerateToken(user, password);

    // if email not yet verified, re-send OTP
    if (!user.emailVerified) {
      await sendOtp(user.email);
      return res.status(200).json({
        message: "Enter the code we just emailed you.",
        email: user.email,
        needsVerification: true,
      });
    }

    // else fully authenticated
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });
    res.status(200).json({ token, user });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};


const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;
  try {
    const user = await checkOtp(email, otp);
    // now issue real JWT
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });
    res.status(200).json({ message: "Email confirmed!", token, user });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};



const resendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    await sendOtp(email);
    res.status(200).json({ message: "OTP sent to email." });
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


module.exports = { registerUser, loginUser, verifyOtp, resendOtp, resetUserPassword, forgotPassword, resetPasswordWithToken };
