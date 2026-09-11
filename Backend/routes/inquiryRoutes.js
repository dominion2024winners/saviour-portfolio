const express = require("express");
const {
  protect,
  adminOnly,
} = require("../middleware/authMiddleware");

const {
  createInquiry,
  getInquiries,
  getInquiry,
  updateInquiryStatus,
  deleteInquiry,
} = require("../controllers/inquiryController");

const router = express.Router();

// Public
router.post("/", createInquiry);

// Admin
router.get("/", protect, adminOnly, getInquiries);
router.get("/:id", protect, adminOnly, getInquiry);
router.patch("/:id/status", protect, adminOnly, updateInquiryStatus);
router.delete("/:id", protect, adminOnly, deleteInquiry);

module.exports = router;