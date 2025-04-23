const express = require('express');
const { registerChiefAdmin, adminLogin, assignAdminRole, adminSignup } = require('../controllers/admin.controller');
const { adminProtect, adminOnly } = require('../middleware/adminProtect'); // 🔥 Import both
const adminAuthMiddleware = require('../middleware/adminAuthMiddleware');

const router = express.Router();

router.post('/register', registerChiefAdmin);
router.post('/login', adminLogin);
router.post('/signup', adminSignup); // New route for normal admins to sign up
router.put('/assign', adminAuthMiddleware, adminProtect, adminOnly, assignAdminRole); // ✅ Now works properly

module.exports = router;
