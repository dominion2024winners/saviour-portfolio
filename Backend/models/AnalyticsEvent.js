const mongoose = require("mongoose");

const analyticsEventSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["page_view", "project_view", "blog_view", "contact_submit"],
      required: true,
    },
    path: {
      type: String,
      default: "",
      trim: true,
    },
    contentId: {
      type: String,
      default: "",
      trim: true,
    },
    contentTitle: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

analyticsEventSchema.index({ createdAt: -1 });
analyticsEventSchema.index({ type: 1, contentId: 1 });

module.exports = mongoose.model("AnalyticsEvent", analyticsEventSchema);
