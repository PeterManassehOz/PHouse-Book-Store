const User = require('../models/users.model');
const path = require('path'); // Import path module if not already imported
const jwt = require('jsonwebtoken');
const bucket = require('../../gcs');


// Reuse the same helper:
async function uploadBufferToGCS(buffer, originalName, mimetype, folder) {
  const timestamp = Date.now();
  const gcsPath = `${folder}/${timestamp}_${originalName.replace(/\s+/g,'_')}`;
  const file = bucket.file(gcsPath);

  return new Promise((resolve, reject) => {
    const stream = file.createWriteStream({ metadata: { contentType: mimetype } });
    stream.on('error', reject);
    stream.on('finish', async () => {
      await file.makePublic();
      resolve(`https://storage.googleapis.com/${bucket.name}/${gcsPath}`);
    });
    stream.end(buffer);
  });
}


// @desc Update user profile
// @route PUT /api/users/profile
// @access Private
exports.updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.username = req.body.username || user.username;
    user.bio      = req.body.bio      || user.bio;

    if (req.file) {
      // stream the in-memory buffer to GCS
      const publicUrl = await uploadBufferToGCS(
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype,
        'users'
      );
      user.image = publicUrl;
    }

    user.profileCompleted = true;
    await user.save();

    const token = jwt.sign(
      { id: user._id, isAdmin: user.isAdmin },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      message: 'Profile updated successfully',
      token,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};



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
