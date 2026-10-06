const express = require("express");
const mongoose = require("mongoose");
const Testimonial = require("../models/Testimonial");
const { protect, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

const normalizeTestimonialInput = (body) => ({
  name: String(body.name || "").trim(),
  role: String(body.role || "").trim(),
  quote: String(body.quote || "").trim(),
  rating: Math.min(5, Math.max(1, Number(body.rating) || 5)),
});

const validateTestimonialInput = (testimonial) => {
  if (!testimonial.name || !testimonial.role || !testimonial.quote) {
    return "Client name, role and testimonial text are required.";
  }

  return "";
};

router.get("/", async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(200).json({
        success: true,
        testimonials: [],
        message: "Database unavailable. Showing empty testimonial list.",
      });
    }

    const testimonials = await Testimonial.find().sort({ createdAt: -1 });
    return res.status(200).json({ success: true, testimonials });
  } catch (error) {
    console.error("Get testimonials error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load testimonials.",
    });
  }
});

router.get("/admin/all", protect, adminOnly, async (req, res) => {
  try {
    const testimonials = await Testimonial.find().sort({ createdAt: -1 });
    return res.status(200).json({ success: true, testimonials });
  } catch (error) {
    console.error("Admin get testimonials error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load testimonials.",
    });
  }
});

router.post("/", protect, adminOnly, async (req, res) => {
  try {
    const clientId = String(req.body.clientId || req.body.id || "").trim();
    const input = normalizeTestimonialInput(req.body);
    const validationError = validateTestimonialInput(input);

    if (!clientId || clientId.length > 100) {
      return res.status(400).json({
        success: false,
        message: "A valid testimonial ID is required.",
      });
    }

    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError,
      });
    }

    const testimonial = await Testimonial.findOneAndUpdate(
      { clientId },
      { ...input, clientId },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );

    return res.status(201).json({
      success: true,
      message: "Testimonial saved successfully.",
      testimonial,
    });
  } catch (error) {
    console.error("Save testimonial error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to save testimonial.",
    });
  }
});

router.put("/:clientId", protect, adminOnly, async (req, res) => {
  try {
    const clientId = String(req.params.clientId || "").trim();
    const input = normalizeTestimonialInput(req.body);
    const validationError = validateTestimonialInput(input);

    if (!clientId || clientId.length > 100) {
      return res.status(400).json({
        success: false,
        message: "A valid testimonial ID is required.",
      });
    }

    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError,
      });
    }

    const testimonial = await Testimonial.findOneAndUpdate(
      { clientId },
      { ...input, clientId },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );

    return res.status(200).json({
      success: true,
      message: "Testimonial updated successfully.",
      testimonial,
    });
  } catch (error) {
    console.error("Update testimonial error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update testimonial.",
    });
  }
});

router.delete("/:clientId", protect, adminOnly, async (req, res) => {
  try {
    const testimonial = await Testimonial.findOneAndDelete({
      clientId: req.params.clientId,
    });

    if (!testimonial) {
      return res.status(404).json({
        success: false,
        message: "Testimonial not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Testimonial deleted successfully.",
    });
  } catch (error) {
    console.error("Delete testimonial error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete testimonial.",
    });
  }
});

module.exports = router;
