const mongoose = require('mongoose');

const failedTransactionSchema = new mongoose.Schema({
  tx_ref: { type: String, required: true },
  transaction_id: { type: String, required: true },
  status: { type: String, default: 'failed' }, // By default, status will be 'failed'
  amount: { type: Number, required: true },
  email: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }, // Date when the transaction was failed
});

module.exports = mongoose.model('FailedTransaction', failedTransactionSchema);
