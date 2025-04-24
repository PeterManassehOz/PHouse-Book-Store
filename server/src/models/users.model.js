const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    firstname: { type: String, required: true },
    lastname: { type: String, required: true },
    username: { type: String, unique: true, sparse: true, }, // Ensure field exists
    email: { type: String, required: true, unique: true },
    phcode: { type: String, required: true },
    state: { type: String, required: true },
    password: { type: String, required: true },
    bio: { type: String, default: '' },
    image: { type: String, default: '' },
    profileCompleted: { type: Boolean, default: false },
    otp:           { type: String, default: null },
    otpExpires:    { type: Date,   default: null },
    emailVerified: { type: Boolean, default: false },
    resetToken: { type: String, default: null },
    resetTokenExpires: { type: Date, default: null },
    isAdmin: { type: Boolean, default: false },
}, { timestamps: true });


const User = mongoose.model('User', userSchema);
module.exports = User;
