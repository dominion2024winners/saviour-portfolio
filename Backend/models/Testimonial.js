const mongoose = require("mongoose");

const testimonialSchema = new mongoose.Schema(
  {
    clientId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      required: true,
      trim: true,
    },
    quote: {
      type: String,
      required: true,
      trim: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
      default: 5,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Testimonial", testimonialSchema);
