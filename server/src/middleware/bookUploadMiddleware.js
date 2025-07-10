// middleware/bookUploadMiddleware.js
const multer = require('multer');

// Use in-memory storage so we can stream to GCS
const storage = multer.memoryStorage();

// ⬇️ split each MIME type into its own entry
const imageTypes = [
  'image/jpeg',
  'image/png',
  'image/jpg',
  'image/gif',
  'image/webp',
];

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (imageTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          'Only JPEG, PNG, JPG, GIF, and WEBP image files are allowed'
        ),
        false
      );
    }
  },
});

module.exports = upload;
