const express = require("express");
const Contact = require("../models/Contact");
const {
  protect,
  adminOnly,
} = require("../middleware/authMiddleware");

const router = express.Router();

/* =========================================================
   SUBMIT CONTACT / PROJECT INQUIRY
   POST /api/contact
   ========================================================= */

router.post("/", async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      service,
      budget,
      message,
    } = req.body;

    // Validate required fields
    if (!name || !email || !phone || !service || !budget || !message) {
      return res.status(400).json({
        success: false,
        message: "Please complete all required fields.",
      });
    }

    // Basic email validation
    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address.",
      });
    }

    // Create inquiry
    const contact = await Contact.create({
      name,
      email,
      phone,
      service,
      budget,
      message,
    });

    res.status(201).json({
      success: true,
      message:
        "Your project inquiry has been sent successfully. I'll get back to you soon.",
      contact: {
        id: contact._id,
        name: contact.name,
        email: contact.email,
        phone: contact.phone,
        service: contact.service,
        budget: contact.budget,
        message: contact.message,
        status: contact.status,
        createdAt: contact.createdAt,
      },
    });
  } catch (error) {
    console.error("Contact submission error:");
    console.error(error);

    res.status(500).json({
      success: false,
      message:
        "Something went wrong while sending your inquiry. Please try again.",
    });
  }
});


/* =========================================================
   GET ALL CONTACT INQUIRIES
   GET /api/contact
   ========================================================= */

router.get("/", protect, adminOnly, async (req, res) => {
  try {
    const contacts = await Contact.find()
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: contacts.length,
      contacts,
    });
  } catch (error) {
    console.error("Fetching contacts error:");
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch contact inquiries.",
    });
  }
});


/* =========================================================
   GET SINGLE CONTACT INQUIRY
   GET /api/contact/:id
   ========================================================= */

router.get("/:id", protect, adminOnly, async (req, res) => {
  try {
    const contact = await Contact.findById(
      req.params.id
    );

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Contact inquiry not found.",
      });
    }

    res.status(200).json({
      success: true,
      contact,
    });
  } catch (error) {
    console.error("Fetching contact error:");
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch contact inquiry.",
    });
  }
});


/* =========================================================
   UPDATE CONTACT STATUS
   PATCH /api/contact/:id/status
   ========================================================= */

router.patch(
  "/:id/status",
  protect,
  adminOnly,
  async (req, res) => {
  try {
    const { status } = req.body;

    const allowedStatuses = [
      "new",
      "read",
      "replied",
      "archived",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid contact status.",
        }
      );
    }

    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      { status },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Contact inquiry not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Contact status updated successfully.",
      contact,
    });
  } catch (error) {
    console.error("Updating contact status error:");
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to update contact status.",
    });
  }
});


/* =========================================================
   DELETE CONTACT INQUIRY
   DELETE /api/contact/:id
   ========================================================= */

router.delete("/:id", protect, adminOnly, async (req, res) => {
  try {
    const contact = await Contact.findByIdAndDelete(
      req.params.id
    );

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Contact inquiry not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Contact inquiry deleted successfully.",
    });
  } catch (error) {
    console.error("Deleting contact error:");
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to delete contact inquiry.",
    });
  }
});


module.exports = router;