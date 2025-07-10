const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  bookTitle: { type: String, required: true },
  quantity: { type: Number, required: true },
});

const adminOrderSchema = new mongoose.Schema({
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true },
  adminName: { type: String, required: true },
  adminState: { type: String, required: true },
  orderItems: { type: [orderItemSchema], required: true },
  message: { type: String },
  status: {
    type: String,
    enum: ["pending", "processing", "shipped", "delivered", "canceled"],
    default: "pending",
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('adminOrder', adminOrderSchema);
