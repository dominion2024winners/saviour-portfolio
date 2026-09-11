const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema(
  {
    profileImage: {
      type: String,
      default: "",
    },

    profileImagePublicId: {
      type: String,
      default: "",
    },

    cvUrl: {
      type: String,
      default: "",
    },

    cvPublicId: {
      type: String,
      default: "",
    },

    cvName: {
      type: String,
      default: "",
    },

    email: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "Profile",
  profileSchema
);