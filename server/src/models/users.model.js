const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    firstname: { type: String, required: true },
    lastname: { type: String, required: true },
    username: { type: String, unique: true, sparse: true, }, // Ensure field exists
    email: { type: String, required: true, unique: true },
    phcode: { type: String, required: true },
    gender: { type: String, enum: ['M', 'F'], required: true }, 
    phonenumber: { type: String, required: true },
    stateCode:    { type: String, required: true, uppercase: true },
    state: { type: String, required: true },
    password: { type: String, required: true },
    bio: { type: String, default: '' },
    image: { type: String, default: '' },
    profileCompleted: { type: Boolean, default: false },
    emailOtp: { type: String, default: null },
    emailOtpExpires: { type: Date,   default: null },
    emailVerified: { type: Boolean, default: false },
    phoneOtp: { type: String, default: null },
    phoneOtpExpires: { type: Date, default: null },
    phoneVerified: { type: Boolean, default: false },
    verificationMethod: { type: String, enum: ['email', 'phone'], default: 'email' },
    resetToken: { type: String, default: null },
    resetTokenExpires: { type: Date, default: null },
    isAdmin: { type: Boolean, default: false },
}, { timestamps: true });


const User = mongoose.model('User', userSchema);
module.exports = User;
