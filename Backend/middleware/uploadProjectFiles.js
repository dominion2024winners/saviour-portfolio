const multer = require("multer");

const MAX_PROJECT_FILE_SIZE = 250 * 1024 * 1024;

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
    // Maximum 250 MB per file
    fileSize: MAX_PROJECT_FILE_SIZE,

    // Maximum 50 files per upload
    files: 50,
  },
});

module.exports = uploadProjectFiles;