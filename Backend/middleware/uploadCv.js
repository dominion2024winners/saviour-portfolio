const multer = require("multer");

const allowedMimeTypes = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

const uploadCv = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, callback) => {
    if (allowedMimeTypes.includes(file.mimetype)) {
      callback(null, true);
      return;
    }

    callback(new Error("Only PDF, DOC, and DOCX files are allowed."), false);
  },
  limits: {
    fileSize: 10 * 1024 * 1024,
    files: 1,
  },
});

module.exports = uploadCv;
