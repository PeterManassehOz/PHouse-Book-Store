const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Define accepted image file types
const imageTypes = ['image/jpeg', 'image/png', 'image/jpg'];

// Set storage engine
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        console.log(`📂 Processing file: ${file.originalname}`);
        console.log(`📄 Uploaded File MIME Type: ${file.mimetype}`);

        
        if (file.fieldname === 'image') {
            uploadPath = 'uploads/images/';
        } else if (file.fieldname === 'authorImage') {
            uploadPath = 'uploads/authorImages/';
           
        }
        console.log(`✅ Assigned upload path: ${uploadPath}`);

          // Ensure the directory exists
         fs.mkdirSync(uploadPath, { recursive: true });

        req.uploadPath = uploadPath; // Store the path for later use
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}_${file.originalname.replace(/\s+/g, "_")}`; // Remove spaces
        req.filePath = `${req.uploadPath}${uniqueName}`; // Store the relative filePath
        
        console.log(`📝 Generated filename: ${uniqueName}`);
        cb(null, uniqueName);
    }
});

// File filter (only images)
const fileFilter = (req, file, cb) => {
    if (imageTypes.includes(file.mimetype)) {
        console.log(`✅ File accepted: ${file.originalname}`);
        cb(null, true);
    } else {
        console.error(`❌ Invalid file type: ${file.mimetype}`);
        cb(new Error('Only JPEG, PNG, and JPG image files are allowed'), false);
    }
};

const upload = multer({ 
    storage, 
    fileFilter 
});

module.exports = upload;
