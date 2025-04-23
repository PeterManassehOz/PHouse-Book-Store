const adminProtect = (req, res, next) => {
    console.log("adminProtect Middleware - req.user:", req.user);

    if (!req.user || req.user.isAdmin === false) {
        return res.status(403).json({ message: "Access denied. Admins only." });
    }
    next();
};

const adminOnly = (req, res, next) => {
    console.log("adminOnly Middleware - req.user:", req.user);

    if (req.user && req.user.isChiefAdmin) {
        next();
    } else {
        res.status(403).json({ message: 'Access denied. Chief Admins only.' });
    }
};

module.exports = { adminProtect, adminOnly };
