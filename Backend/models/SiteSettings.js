const mongoose = require("mongoose");

const siteSettingsSchema = new mongoose.Schema(
  {
    profileImage: {
      type: String,
      default: "",
    },

    profileImagePublicId: {
      type: String,
      default: "",
    },

    websiteEnabled: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "SiteSettings",
  siteSettingsSchema
);