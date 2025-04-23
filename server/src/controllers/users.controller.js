const User = require('../models/users.model');
const path = require('path'); // Import path module if not already imported

// @desc Get user profile
// @route GET /api/users/profile
// @access Private
exports.getUserProfile = async (req, res) => {
    const user = await User.findById(req.user.id).select('-password');

    if (user) {
        res.json(user);
    } else {
        res.status(404).json({ message: 'User not found' });
    }
};

// @desc Update user profile
// @route PUT /api/users/profile
// @access Private
exports.updateUserProfile = async (req, res) => {
    const user = await User.findById(req.user.id);

    if (user) {
        user.username = req.body.username || user.username;
        user.bio = req.body.bio || user.bio;

        if (req.file) {
            user.image = req.file.path.replace(/\\/g, "/");
        }

        user.profileCompleted = true;
        await user.save();
        res.json({ message: 'Profile updated successfully' });
    } else {
        res.status(404).json({ message: 'User not found' });
    }
};
