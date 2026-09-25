const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, default: "" },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", default: null },
    price: { type: Number, required: true, min: 0 },
    mrp: { type: Number, default: 0, min: 0 }, // original price; when higher than `price` a discount badge is shown
    discountPercent: { type: Number, default: 0 }, // calculated automatically
    images: [
      {
        url: { type: String, required: true },
        publicId: { type: String, default: "" }, // Cloudinary public_id, used for deletion
        _id: false,
      },
    ],
    colors: [{ type: String, trim: true }],
    tags: [{ type: String, trim: true }],
    isAvailable: { type: Boolean, default: true }, // false shows "Out of stock"
    isFeatured: { type: Boolean, default: false }, // shown in "Trending now" on the home page
    isVisible: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

productSchema.pre("validate", function (next) {
  this.discountPercent =
    this.mrp && this.price != null && this.mrp > this.price ? Math.round(((this.mrp - this.price) / this.mrp) * 100) : 0;
  next();
});

productSchema.index({ isVisible: 1, category: 1, price: 1 });

module.exports = mongoose.model("Product", productSchema);
