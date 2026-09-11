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

    brandName: {
      type: String,
      default: "Saviour Nkantion",
    },

    title: {
      type: String,
      default: "Graphic Designer & Developer",
    },

    heroTitle: {
      type: String,
      default: "I create digital experiences that stand out.",
    },

    heroDescription: {
      type: String,
      default: "I design and build modern websites, visual identities, digital experiences and creative solutions for brands, businesses and individuals.",
    },

    email: {
      type: String,
      default: "",
    },

    phone: {
      type: String,
      default: "",
    },

    whatsapp: {
      type: String,
      default: "",
    },

    bookingUrl: {
      type: String,
      default: "",
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