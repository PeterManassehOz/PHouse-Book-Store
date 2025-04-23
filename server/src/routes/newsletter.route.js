const express = require("express");
const { subscribeNewsletter, getSubscriptionStatus, getAllSubscribersForStateAdmin } = require("../controllers/newsletter.controller");
const { protect } = require("../middleware/authMiddleware");
const adminAuthMiddleware = require("../middleware/adminAuthMiddleware");
const { adminProtect } = require("../middleware/adminProtect");



const router = express.Router();

router.post("/subscribe", protect, subscribeNewsletter);
router.post("/subscription-status", protect, getSubscriptionStatus);
router.get('/admin-subscribers', adminAuthMiddleware, adminProtect, getAllSubscribersForStateAdmin);

module.exports = router;