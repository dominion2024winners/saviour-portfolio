const multer = require("multer");

// ============================================================
// MEMORY STORAGE
// ============================================================

const storage = multer.memoryStorage();

// ============================================================
// ALLOWED PROJECT FILE TYPES
// ============================================================

const allowedMimeTypes = [
  // Images
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",

  // PDF
  "application/pdf",

  // ZIP
  "application/zip",
  "application/x-zip-compressed",

  // RAR
  "application/vnd.rar",
  "application/x-rar-compressed",

  // Text
  "text/plain",

  // Microsoft Word
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",

  // Microsoft PowerPoint
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
];

// ============================================================
// FILE FILTER
// ============================================================

const fileFilter = (req, file, cb) => {
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `File type not supported: ${file.originalname}`
      ),
      false
    );
  }
};

// ============================================================
// MULTER CONFIGURATION
// ============================================================

const uploadProjectFiles = multer({
  storage,

  fileFilter,

  limits: {
    // Maximum 50 MB per file
    fileSize: 50 * 1024 * 1024,

    // Maximum 10 files per upload
    files: 10,
  },
});

module.exports = uploadProjectFiles;