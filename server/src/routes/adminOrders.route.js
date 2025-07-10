const express = require('express');
const { createAdminOrder, getAdminOrders, updateAdminOrderStatus, getAdminOrderStatus, getAllStatesOrdersForChiefAdmin, getOrdersByStateForChiefAdmin,  getAdminOrderStatistics } = require('../controllers/adminOrders.controller');
const adminAuthMiddleware = require('../middleware/adminAuthMiddleware');
const { adminProtect } = require('../middleware/adminProtect');

const router = express.Router();

router.post('/', adminAuthMiddleware, createAdminOrder);
router.get('/', adminAuthMiddleware, getAdminOrders);
router.put('/status', adminAuthMiddleware, adminProtect, updateAdminOrderStatus);
router.get('/status/:orderId', adminAuthMiddleware, getAdminOrderStatus);
router.get('/chief-admin-orders', adminAuthMiddleware, adminProtect, getAllStatesOrdersForChiefAdmin);
router.get('/chief-admin-orders/:state', adminAuthMiddleware, adminProtect, getOrdersByStateForChiefAdmin);
router.get('/statistics', adminAuthMiddleware, adminProtect, getAdminOrderStatistics);

module.exports = router;