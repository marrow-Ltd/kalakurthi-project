const mongoose = require("mongoose");

const testimonialSchema = new mongoose.Schema(
  {
    customerName: { type: String, required: true },
    customerPhoto: { type: String, default: "" },
    customerPhotoPublicId: { type: String, default: "" },
    message: { type: String, required: true },
    rating: { type: Number, min: 1, max: 5, default: 5 },
    isVisible: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Testimonial", testimonialSchema);
