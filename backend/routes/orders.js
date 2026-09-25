const express = require("express");
const rateLimit = require("express-rate-limit");
const Order = require("../models/Order");
const { verifyToken, isAdmin } = require("../middleware/auth");
const upload = require("../middleware/upload");
const { destroyImages } = require("../config/cloudinary");

const router = express.Router();

// This form is public and accepts image uploads, so it needs its own tighter limit
// on top of the general API limiter — otherwise it's an easy spam / storage-abuse target.
const orderLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 8,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests submitted. Please try again in a bit, or message us on WhatsApp." },
});

// POST /api/orders — public, no login. Up to 4 reference images (uploaded to Cloudinary).
router.post("/", orderLimiter, upload.array("referenceImages", 4), async (req, res) => {
  try {
    const { name, email, phone, serviceType, notes, targetDeliveryDate } = req.body;

    if (!name || !phone || !serviceType) {
      // Don't leave orphaned uploads behind on a rejected request
      await destroyImages((req.files || []).map((f) => f.filename));
      return res.status(400).json({ message: "Name, phone, and service type are required." });
    }

    const order = await Order.create({
      name,
      email,
      phone,
      serviceType,
      notes,
      targetDeliveryDate: targetDeliveryDate || undefined,
      referenceImages: (req.files || []).map((f) => f.path),
      referenceImagePublicIds: (req.files || []).map((f) => f.filename),
    });

    res.status(201).json({ message: "Your custom order request has been received!", order });
  } catch (err) {
    console.error(err);
    await destroyImages((req.files || []).map((f) => f.filename));
    res.status(400).json({ message: err.message || "Failed to submit order." });
  }
});

// GET /api/orders — admin only, with optional ?status= filter
router.get("/", verifyToken, isAdmin, async (req, res) => {
  try {
    const filter = {};
    if (req.query.status && req.query.status !== "All") {
      filter.status = req.query.status;
    }
    const orders = await Order.find(filter).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: "Failed to load orders." });
  }
});

// PATCH /api/orders/:id/status — admin only
router.patch("/:id/status", verifyToken, isAdmin, async (req, res) => {
  try {
    const { status, adminRemarks } = req.body;
    const validStatuses = ["Pending", "In Progress", "Completed", "Cancelled"];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status value." });
    }
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { ...(status && { status }), ...(adminRemarks !== undefined && { adminRemarks }) },
      { new: true }
    );
    if (!order) return res.status(404).json({ message: "Order not found." });
    res.json(order);
  } catch (err) {
    res.status(400).json({ message: "Failed to update order." });
  }
});

// DELETE /api/orders/:id — admin only (also removes reference images from Cloudinary)
router.delete("/:id", verifyToken, isAdmin, async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found." });
    await destroyImages(order.referenceImagePublicIds);
    res.json({ message: "Order deleted." });
  } catch (err) {
    res.status(400).json({ message: "Failed to delete order." });
  }
});

module.exports = router;
