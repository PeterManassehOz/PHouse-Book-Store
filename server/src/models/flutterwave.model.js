const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  email: { type: String, required: true },
  phone_number: { type: String, required: true },
  name: { type: String, required: true },
});

const flutterwaveTransactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  transactionId: { type: String, unique: true, required: true },
  transactionRef: { type: String, required: true },
  amount: { type: String, required: true },
  currency: { type: String, required: true },
  paymentType: { type: String },
  customer: { type: customerSchema, required: true },
  status: { type: String, required: true },
  paymentDate: { type: String },
  state: { type: String },
});

const FlutterwaveTransaction = mongoose.model('FlutterwaveTransaction', flutterwaveTransactionSchema);

module.exports = FlutterwaveTransaction;
