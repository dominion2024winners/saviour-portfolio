const Inquiry = require("../models/Inquiry");

// ============================================================
// CREATE INQUIRY
// ============================================================

const createInquiry = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      service,
      budget,
      startDate,
      message,
    } = req.body;

    // ----------------------------------------------------------
    // VALIDATION
    // ----------------------------------------------------------

    if (!name || !email || !service || !message) {
      return res.status(400).json({
        success: false,
        message:
          "Name, email, service and project details are required.",
      });
    }

    // ----------------------------------------------------------
    // CREATE INQUIRY
    // ----------------------------------------------------------

    const inquiry = await Inquiry.create({
      name,
      email,
      phone,
      service,
      budget,
      startDate,
      message,
    });

    return res.status(201).json({
      success: true,
      message:
        "Your project request has been submitted successfully.",
      inquiry,
    });
  } catch (error) {
    console.error("Create inquiry error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to submit your project request.",
    });
  }
};

// ============================================================
// GET ALL INQUIRIES
// ============================================================

const getInquiries = async (req, res) => {
  try {
    const inquiries = await Inquiry.find().sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      count: inquiries.length,
      inquiries,
    });
  } catch (error) {
    console.error("Get inquiries error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch inquiries.",
    });
  }
};

// ============================================================
// GET SINGLE INQUIRY
// ============================================================

const getInquiry = async (req, res) => {
  try {
    const inquiry = await Inquiry.findById(req.params.id);

    if (!inquiry) {
      return res.status(404).json({
        success: false,
        message: "Inquiry not found.",
      });
    }

    return res.status(200).json({
      success: true,
      inquiry,
    });
  } catch (error) {
    console.error("Get inquiry error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch inquiry.",
    });
  }
};

// ============================================================
// UPDATE INQUIRY STATUS
// ============================================================

const updateInquiryStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const allowedStatuses = [
      "New",
      "Contacted",
      "In Progress",
      "Completed",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid inquiry status.",
      });
    }

    const inquiry = await Inquiry.findByIdAndUpdate(
      req.params.id,
      { status },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!inquiry) {
      return res.status(404).json({
        success: false,
        message: "Inquiry not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Inquiry status updated.",
      inquiry,
    });
  } catch (error) {
    console.error("Update inquiry status error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update inquiry status.",
    });
  }
};

// ============================================================
// DELETE INQUIRY
// ============================================================

const deleteInquiry = async (req, res) => {
  try {
    const inquiry = await Inquiry.findByIdAndDelete(
      req.params.id
    );

    if (!inquiry) {
      return res.status(404).json({
        success: false,
        message: "Inquiry not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Inquiry deleted successfully.",
    });
  } catch (error) {
    console.error("Delete inquiry error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to delete inquiry.",
    });
  }
};

module.exports = {
  createInquiry,
  getInquiries,
  getInquiry,
  updateInquiryStatus,
  deleteInquiry,
};