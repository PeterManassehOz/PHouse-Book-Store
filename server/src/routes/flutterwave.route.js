const express = require('express');
const router = express.Router();
const {
  saveTransaction,
  verifyTransaction,
  getUserTransactions,
  getAllTransactions,
  getAllTransactionsForStateAdmin,
  handleWebhook,
  getAllStatesTransactionsForChiefAdmin,
  getTransactionsByStateForChiefAdmin,
} = require('../controllers/flutterwave.controller');
const { protect } = require('../middleware/authMiddleware');
const { adminProtect } = require('../middleware/adminProtect');
const adminAuthMiddleware = require('../middleware/adminAuthMiddleware');

router.post('/save-transaction', protect, saveTransaction);
router.get('/verify/:tx_id', verifyTransaction);
router.get('/transactions', getAllTransactions);
router.get('/admin-transactions', adminAuthMiddleware, adminProtect, getAllTransactionsForStateAdmin);
router.get('/user-transactions', protect, getUserTransactions);
router.post('/webhook', express.json({ type: 'application/json' }), handleWebhook); // make sure express.json() is applied
router.get('/chief-admin-transactions', adminAuthMiddleware, adminProtect, getAllStatesTransactionsForChiefAdmin);
router.get('/chief-admin-transactions/:state', adminAuthMiddleware, adminProtect, getTransactionsByStateForChiefAdmin);

module.exports = router;
