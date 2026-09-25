const express = require("express");
const Testimonial = require("../models/Testimonial");
const { verifyToken, isAdmin } = require("../middleware/auth");
const upload = require("../middleware/upload");
const { destroyImage } = require("../config/cloudinary");

const router = express.Router();

// GET /api/testimonials — public
router.get("/", async (req, res) => {
  try {
    const items = await Testimonial.find({ isVisible: true }).sort({ order: 1, createdAt: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: "Failed to load testimonials." });
  }
});

// GET /api/testimonials/all — admin only
router.get("/all", verifyToken, isAdmin, async (req, res) => {
  try {
    const items = await Testimonial.find().sort({ order: 1, createdAt: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: "Failed to load testimonials." });
  }
});

// POST /api/testimonials — admin only
router.post("/", verifyToken, isAdmin, upload.single("customerPhoto"), async (req, res) => {
  try {
    const { customerName, message, rating, isVisible, order } = req.body;
    const item = await Testimonial.create({
      customerName,
      message,
      rating: rating || 5,
      customerPhoto: req.file ? req.file.path : "",
      customerPhotoPublicId: req.file ? req.file.filename : "",
      isVisible: isVisible === "false" ? false : true,
      order: order || 0,
    });
    res.status(201).json(item);
  } catch (err) {
    res.status(400).json({ message: err.message || "Failed to add testimonial." });
  }
});

// PUT /api/testimonials/:id — admin only
router.put("/:id", verifyToken, isAdmin, upload.single("customerPhoto"), async (req, res) => {
  try {
    const updates = { ...req.body };
    if (updates.isVisible !== undefined) updates.isVisible = updates.isVisible === "true" || updates.isVisible === true;
    delete updates.customerPhotoPublicId;

    const existing = await Testimonial.findById(req.params.id);
    if (!existing) {
      if (req.file) await destroyImage(req.file.filename);
      return res.status(404).json({ message: "Testimonial not found." });
    }

    if (req.file) {
      updates.customerPhoto = req.file.path;
      updates.customerPhotoPublicId = req.file.filename;
    }

    const item = await Testimonial.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });
    if (req.file) await destroyImage(existing.customerPhotoPublicId);
    res.json(item);
  } catch (err) {
    res.status(400).json({ message: "Failed to update testimonial." });
  }
});

// DELETE /api/testimonials/:id — admin only
router.delete("/:id", verifyToken, isAdmin, async (req, res) => {
  try {
    const item = await Testimonial.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ message: "Testimonial not found." });
    await destroyImage(item.customerPhotoPublicId);
    res.json({ message: "Testimonial deleted." });
  } catch (err) {
    res.status(400).json({ message: "Failed to delete testimonial." });
  }
});

module.exports = router;
