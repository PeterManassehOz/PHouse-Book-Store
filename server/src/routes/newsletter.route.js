const express = require("express");
const { subscribeNewsletter, getSubscriptionStatus, getAllSubscribersForStateAdmin, sendNewsletter } = require("../controllers/newsletter.controller");
const { protect } = require("../middleware/authMiddleware");
const adminAuthMiddleware = require("../middleware/adminAuthMiddleware");
const { adminProtect } = require("../middleware/adminProtect");



const router = express.Router();

router.post("/subscribe", protect, subscribeNewsletter);
router.post("/subscription-status", protect, getSubscriptionStatus);
router.get('/admin-subscribers', adminAuthMiddleware, adminProtect, getAllSubscribersForStateAdmin);
router.post('/send-newsletter', adminAuthMiddleware, adminProtect, sendNewsletter);

module.exports = router;