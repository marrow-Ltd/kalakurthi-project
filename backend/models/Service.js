const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, required: true },
    icon: { type: String, default: "Sparkles" }, // lucide-react icon name
    image: { type: String, default: "" },
    imagePublicId: { type: String, default: "" }, // Cloudinary public_id, used for deletion
    priceLabel: { type: String, default: "Starting from ₹499" },
    features: [{ type: String }],
    isVisible: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Service", serviceSchema);
