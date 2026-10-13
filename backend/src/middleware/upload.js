const multer = require('multer');
const maxFileSize = process.env.VERCEL ? 4 * 1024 * 1024 : 10 * 1024 * 1024;

// Memory storage to handle file buffer before uploading to Cloudinary
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (jpg, jpeg, png, webp, gif) are allowed!'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: maxFileSize
  },
  fileFilter: fileFilter
});

module.exports = upload;
