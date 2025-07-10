const express = require('express');
const { createOrder, getOrdersForAdmin, getOrdersForUser, updateOrderStatus, getOrderStatus, getAllStatesOrdersForChiefAdmin, getOrdersByStateForChiefAdmin } = require('../controllers/orders.controller');
const { protect } = require('../middleware/authMiddleware');
const adminAuthMiddleware = require('../middleware/adminAuthMiddleware');
const { adminProtect } = require('../middleware/adminProtect');

const router = express.Router();



router.post('/', protect, createOrder);
router.get('/admin', adminAuthMiddleware, adminProtect, getOrdersForAdmin);
router.get('/user', protect, getOrdersForUser);
router.put('/status', adminAuthMiddleware, adminProtect, updateOrderStatus);
router.get('/status/:orderId', protect, getOrderStatus);
router.get('/chief-admin-orders', adminAuthMiddleware, adminProtect, getAllStatesOrdersForChiefAdmin);
router.get('/chief-admin-orders/:state', adminAuthMiddleware, adminProtect, getOrdersByStateForChiefAdmin);
router


module.exports = router;