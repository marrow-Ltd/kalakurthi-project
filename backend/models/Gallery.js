const mongoose = require("mongoose");

const gallerySchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    image: { type: String, required: true },
    imagePublicId: { type: String, default: "" }, // Cloudinary public_id, used for deletion
    tags: [{ type: String, trim: true }], // e.g. Crochet, Hoop Art, Custom Clothing
    isFeatured: { type: Boolean, default: false },
    isVisible: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Gallery", gallerySchema);
