const mongoose = require("mongoose");

// Shop categories: the round icons on the home page, the Categories page cards, and the shop filter
const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    tagline: { type: String, default: "", trim: true },
    icon: { type: String, default: "Sparkles" }, // lucide-react icon name, used when there's no image
    color: { type: String, default: "#F6D9DC" }, // soft background / halo colour
    image: { type: String, default: "" },
    imagePublicId: { type: String, default: "" },
    isVisible: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Category", categorySchema);
