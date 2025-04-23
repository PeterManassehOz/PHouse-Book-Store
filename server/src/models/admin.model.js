const mongoose = require('mongoose');

const AdminSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    state: { type: String, required: true },
    phcode: { type: String, required: true },
    password: { type: String, required: true },
    isAdmin: { type: Boolean, default: true },
    isChiefAdmin: { type: Boolean, default: false }
});

module.exports = mongoose.model('Admin', AdminSchema);
