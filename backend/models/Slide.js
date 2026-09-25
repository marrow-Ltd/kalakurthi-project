const mongoose = require("mongoose");

// Hero slider banners shown at the top of the home page
const slideSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    subtitle: { type: String, default: "", trim: true },
    badge: { type: String, default: "", trim: true }, // small pill above the title, e.g. "Festive Sale"
    ctaText: { type: String, default: "Shop Now", trim: true },
    ctaLink: {
      type: String,
      default: "/shop",
      trim: true,
      match: [/^(\/|https?:\/\/)/, "Link must start with / or http(s)://"],
    },
    image: { type: String, default: "" },
    imagePublicId: { type: String, default: "" },
    bgFrom: { type: String, default: "#6A1B38" },
    bgTo: { type: String, default: "#C86D51" },
    textTheme: { type: String, enum: ["light", "dark"], default: "light" },
    isVisible: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Slide", slideSchema);
