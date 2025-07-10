const FlutterwaveTransaction = require('../models/flutterwave.model');

const saveTransactionService = async (data) => {
  try {
    console.log('💾 Data received in service:', data);

    if (
      !data.transactionId ||
      !data.tx_ref ||
      !data.customer?.email ||
      !data.customer?.phone_number ||
      !data.customer?.name
    ) {
      throw new Error('Invalid payload: missing required fields');
    }

    const existing = await FlutterwaveTransaction.findOne({ transactionId: String(data.transactionId) });
    if (existing) return { message: 'Transaction already exists' };

    const transaction = new FlutterwaveTransaction({
      transactionId: String(data.transactionId),
      transactionRef: data.tx_ref,
      amount: String(data.amount || '0'),
      currency: data.currency || 'NGN',
      paymentType: data.paymentType || 'unknown',
      customer: {
        email: data.customer.email,
        phone_number: data.customer.phone_number,
        name: data.customer.name,
      },
      paymentDate: data.paymentDate || new Date().toISOString(),
      status: data.status || 'pending',
      state: data.state || null,
      userId: data.userId || null,
    });

    await transaction.save();
    return { message: 'Transaction saved successfully' };

  } catch (err) {
    console.error('🔥 Error while saving transaction to DB:', err);
    throw new Error('Database error: ' + err.message);
  }
};

module.exports = { saveTransactionService };
