const FlutterwaveTransaction = require('../models/flutterwave.model');
const { saveTransactionService } = require('../services/flutterwave.services');
require('dotenv').config();
const Flutterwave = require('flutterwave-node-v3');
const flw = new Flutterwave(process.env.FLW_PUBLIC_KEY, process.env.FLW_SECRET_KEY);

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

const saveTransaction = async (req, res) => {
  console.log('📥 Incoming transaction data:', req.body); // Log data coming in
  try {
    if (req.user?.state) {
      req.body.state = req.user.state;
    }

    if (req.user?._id) {
      req.body.userId = req.user._id; // 👈 assign the userId from the logged-in user
    }

    const result = await saveTransactionService(req.body);
    console.log('✅ Transaction saved:', result);
    res.status(201).json(result);
  } catch (err) {
    console.error('❌ Error saving transaction:', err.stack || err.message); // Full stack trace
    res.status(500).json({ message: err.message || 'Failed to save transaction' });
  }
};



const retryVerification = async (transaction_id, retries = 5, delayTime = 10000) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await flw.Transaction.verify({ id: transaction_id });
      if (response.status === 'success' && response.data.status === 'successful') {
        return response.data;
      }
    } catch (error) {
      console.error(`Attempt ${attempt} failed:`, error.message);
    }
    await delay(delayTime);
  }
  throw new Error('Transaction verification failed after retries');
};

const verifyTransaction = async (req, res) => {
  const { tx_id } = req.params;
  try {
    const response = await flw.Transaction.verify({ id: tx_id });

    if (response.status !== 'success' || response.data.status !== 'successful') {
      return res.status(400).json({ message: 'Transaction not verified', data: response.data });
    }

    const dataToSave = {
      transactionId: response.data.id,
      tx_ref: response.data.tx_ref,
      currency: response.data.currency,
      amount: response.data.amount,
      paymentType: response.data.payment_type,
      customer: {
        email: response.data.customer.email,
        phone_number: response.data.customer.phone_number,
        name: response.data.customer.name,
      },
      paymentDate: response.data.created_at,
      status: response.data.status,
    };

    const saveResult = await saveTransactionService(dataToSave);
    res.status(200).json({ ...response.data, saveResult });

  } catch (error) {
    console.error('Verification error:', error.message);
    res.status(500).json({ message: 'Error verifying transaction', error: error.message });
  }
};

const handleWebhook = async (req, res) => {
  try {
    const event = req.body;
    console.log('Webhook event received:', JSON.stringify(event, null, 2));

    const { data } = event;
    const { tx_ref, status, id: transaction_id } = data;

    if (!data?.customer) throw new Error('Missing customer data in webhook');

    if (status === 'successful' || status === 'completed') {
      const verifiedTransaction = await retryVerification(transaction_id);

      const dataToSave = {
        transactionId: verifiedTransaction.id,
        tx_ref: verifiedTransaction.tx_ref,
        currency: verifiedTransaction.currency,
        amount: verifiedTransaction.amount,
        paymentType: verifiedTransaction.payment_type,
        customer: {
          email: verifiedTransaction.customer.email,
          phone_number: verifiedTransaction.customer.phone_number,
          name: verifiedTransaction.customer.name,
        },
        paymentDate: verifiedTransaction.created_at,
        status: verifiedTransaction.status,
      };

      await saveTransactionService(dataToSave);
      return res.status(200).send('Webhook processed');
    }

    res.status(400).send('Transaction failed or pending');
  } catch (error) {
    console.error('Webhook error:', error.message);
    res.status(500).send('Webhook failed');
  }
};



const getAllTransactions = async (req, res) => {
  try {
    const response = await flw.Transaction.fetch_all();
    res.status(200).json(response);
  } catch (error) {
    console.error('Fetch error:', error.message);
    res.status(500).json({ message: 'Could not fetch transactions', error });
  }
};


const getUserTransactions = async (req, res) => {
  try {
    const userId = req.user?._id;

    if (!userId) return res.status(400).json({ message: 'User ID not found in request' });

    const transactions = await FlutterwaveTransaction.find({ userId }).sort({ paymentDate: -1 });

    res.status(200).json(transactions);
  } catch (err) {
    console.error('Fetch user transactions error:', err.message);
    res.status(500).json({ message: 'Failed to fetch user transactions' });
  }
};



const getAllTransactionsForStateAdmin = async (req, res) => {
  try {
    const admin = req.user; // Get admin from JWT
    console.log('Admin making request:', req.user);


    if (!admin.isAdmin) {
      return res.status(403).json({ message: "Unauthorized to view transactions." });
    }

    // Fetch transactions based on the admin's state
    const transactions = await FlutterwaveTransaction.find({ state: admin.state }).sort({ paymentDate: -1 }) .limit(4) // Get the last 4
    .populate('userId', 'username image'); ;

    if (transactions.length === 0) {
      return res.status(404).json({ message: 'No transactions found for this state.' });
    }

    res.status(200).json(transactions);
  } catch (error) {
    console.error('Error fetching transactions for state admin:', error.message);
    res.status(500).json({ message: 'Error fetching transactions', error: error.message });
  }
};





const getAllStatesTransactionsForChiefAdmin = async (req, res) => {
  try {
    const admin = req.user;
    if (!admin.isAdmin || !admin.isChiefAdmin) {
      return res.status(403).json({ message: 'Unauthorized.' });
    }

    const txns = await FlutterwaveTransaction.find({ state: { $ne: admin.state } })
      .populate('userId', 'username image')
      .sort({ paymentDate: -1 });

    const byState = txns.reduce((acc, tx) => {
      acc[tx.state] = acc[tx.state] || [];
      acc[tx.state].push(tx);
      return acc;
    }, {});

    res.status(200).json(byState);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

const getTransactionsByStateForChiefAdmin = async (req, res) => {
  try {
    const admin = req.user;
    const { state } = req.params;
    if (!admin.isAdmin || !admin.isChiefAdmin) {
      return res.status(403).json({ message: 'Unauthorized.' });
    }

    const txns = await FlutterwaveTransaction.find({ state })
      .populate('userId', 'username image')
      .sort({ paymentDate: -1 });

    res.status(200).json(txns);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};




module.exports = {
  saveTransaction,
  verifyTransaction,
  getAllTransactions,
  handleWebhook,
  getUserTransactions,
  getAllTransactionsForStateAdmin,
  getAllStatesTransactionsForChiefAdmin,
  getTransactionsByStateForChiefAdmin,
};
