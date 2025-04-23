const jwt = require('jsonwebtoken');
const User = require('../models/users.model');
const Admin = require('../models/admin.model');

exports.userAdminAuth = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Not authorized, no token' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    let account = await User.findById(decoded.id).select('-password');
    if (account) {
      req.user = account;
    } else {
      account = await Admin.findById(decoded.id).select('-password');
      if (account) req.admin = account;
    }

    if (!account) return res.status(401).json({ message: 'Not authorized' });
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token failed or invalid' });
  }
};
