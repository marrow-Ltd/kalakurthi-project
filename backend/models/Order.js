const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    email: { type: String, default: "", trim: true, maxlength: 254 }, // optional — customers usually follow up on WhatsApp
    phone: { type: String, required: true, trim: true, maxlength: 20 },
    serviceType: { type: String, required: true, trim: true, maxlength: 120 }, // e.g. Photo Embroidery, Crochet Item
    notes: { type: String, default: "", trim: true, maxlength: 2000 },
    referenceImages: [{ type: String }], // Cloudinary URLs
    referenceImagePublicIds: [{ type: String }], // Cloudinary public_ids, used for deletion
    targetDeliveryDate: { type: Date },
    status: {
      type: String,
      enum: ["Pending", "In Progress", "Completed", "Cancelled"],
      default: "Pending",
    },
    adminRemarks: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
