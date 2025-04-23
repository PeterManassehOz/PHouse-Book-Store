const Admin = require('../models/admin.model');
const { verifyPasswordAndGenerateToken, generateTokenPassword } = require('../utils/generateTokenPassword');




// @desc Register Chief Admin
// @route POST /api/admin/register-chief
// @access Public (Only for the first time)
exports.registerChiefAdmin = async (req, res) => {
    const { name, email, phcode, state, password } = req.body;

    try {
        // Check if a Chief Admin already exists
        const existingChief = await Admin.findOne({ isChiefAdmin: true });
        if (existingChief) {
            return res.status(400).json({ message: "A Chief Admin already exists." });
        }

        // Hash password first before creating the admin
        const { hashedPassword } = await generateTokenPassword({}, password);

        // Create new Chief Admin
        const chiefAdmin = await Admin.create({
            name,
            email,
            phcode,
            state,
            password: hashedPassword,
            isAdmin: true,
            isChiefAdmin: true,
        });

        // Now generate token using the created chiefAdmin
        const { token } = await generateTokenPassword(chiefAdmin, password);

        res.status(201).json({
            name: chiefAdmin.name,
            email: chiefAdmin.email,
            phcode: chiefAdmin.phcode,
            state: chiefAdmin.state,
            isAdmin: chiefAdmin.isAdmin,
            isChiefAdmin: chiefAdmin.isChiefAdmin,
            token,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};



// @desc Admin login
// @route POST /api/admin/login
// @access Public
exports.adminLogin = async (req, res) => {
    const { state, phcode, password } = req.body;

    try {
        // Check if admin exists
        const admin = await Admin.findOne({ state, phcode });
        if (!admin) {
            return res.status(401).json({ message: 'Invalid phone code, state, or password' });
        }

        // Verify password and generate token
        const { token } = await verifyPasswordAndGenerateToken(admin, password);
        if (!token) {
            return res.status(401).json({ message: 'Invalid password' });
        }

        res.json({
            name: admin.name,
            email: admin.email,
            phcode: admin.phcode,
            state: admin.state,
            isAdmin: admin.isAdmin,
            isChiefAdmin: admin.isChiefAdmin,
            token,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};



// @desc Admin Signup (Pending Approval)
// @route POST /api/admin/signup
// @access Public (Anyone can sign up, but access is restricted)
exports.adminSignup = async (req, res) => {
    const { name, email, phcode, state, password } = req.body;

    try {
        // Check if admin already exists
        const existingAdmin = await Admin.findOne({ state, phcode });
        if (existingAdmin) {
            return res.status(400).json({ message: "Admin already exists." });
        }

        // Hash password
        const { hashedPassword } = await generateTokenPassword({}, password);

        // Create new admin (but not yet approved)
        const newAdmin = await Admin.create({
            name,
            email,
            phcode,
            state,
            password: hashedPassword,
            isAdmin: false,  // 🚨 Not an admin yet!
            isChiefAdmin: false
        });

        res.status(201).json({
            message: "Admin registered successfully, awaiting approval from the Chief Admin.",
            name: newAdmin.name,
            email: newAdmin.email,
            phcode: newAdmin.phcode,
            state: newAdmin.state,
            isAdmin: newAdmin.isAdmin,
            isChiefAdmin: newAdmin.isChiefAdmin
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};



// @desc Assign admin role
// @route PUT /api/admin/assign
// @access Private (Chief Admin Only)
exports.assignAdminRole = async (req, res) => {
    const { state, phcode } = req.body; // State and PHCode of the user to be promoted

    try {
        // Check if requester is a Chief Admin
        const requester = await Admin.findById(req.user.id);
        if (!requester || !requester.isChiefAdmin) {
            return res.status(403).json({ message: 'Access denied. Chief Admins only.' });
        }

        // Find the admin to promote
        const admin = await Admin.findOne({ state, phcode });
        if (!admin) {
            return res.status(404).json({ message: 'Admin not found' });
        }

        // Update the admin's role to admin
        admin.isAdmin = true;
        await admin.save();

        res.json({ message: 'The admin has been granted admin privileges.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};