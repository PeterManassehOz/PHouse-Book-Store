// middleware/uploadUserMiddleware.js
// ──────────────────────────────────────────────────────────────────────────────
const multer = require('multer');

// Store uploads in memory so we can forward them to GCS
const storage = multer.memoryStorage();

const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg, image/gif', 'image/webp'];

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, GIF, WEBP and JPG image files are allowed'), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // optional: limit to 5 MB
  },
});

module.exports = upload;