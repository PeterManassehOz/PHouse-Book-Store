const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, // To track which user placed the order
    },
    name: {  type: String,  required: true,},
    email: {  type: String,   required: true, },
    phone: { type: String,    required: true,  },
    street: {  type: String,    required: true,},
    city: { type: String,required: true, },
    zipcode: {  type: String, required: true, },
    state: {   type: String, required: true, // This ensures orders are only sent to the correct state admin
    },
    items: [{
      bookId:   { type: mongoose.Schema.Types.ObjectId, ref: "Book", required: true },
      quantity: { type: Number, required: true, min: 1 },
    }],
    totalPrice: { type: Number, required: true,  },
    status: {
      type: String,
      enum: ["pending", "processing", "shipped", "delivered", "canceled"],
      default: "pending", // Default order status
    },
  },
  { timestamps: true } // Adds createdAt and updatedAt timestamps
);

module.exports = mongoose.model("Order", OrderSchema);
