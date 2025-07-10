const jwt = require("jsonwebtoken");
const Admin = require("../models/admin.model");

const adminAuthMiddleware = async (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1]; // Extract token from headers
    if (!token) {
        return res.status(401).json({ message: "No token provided, authorization denied." });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify JWT
        req.user = await Admin.findById(decoded.id).select("-password"); // Attach user to req
        console.log("Authenticated User:", req.user); // Log for debugging
        next();
    } catch (error) {
        return res.status(401).json({ message: "Invalid token." });
    }
};

module.exports = adminAuthMiddleware;
