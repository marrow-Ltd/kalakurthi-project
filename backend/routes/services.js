const express = require("express");
const Service = require("../models/Service");
const { verifyToken, isAdmin } = require("../middleware/auth");
const upload = require("../middleware/upload");
const { destroyImage } = require("../config/cloudinary");

const router = express.Router();

const slugify = (str) =>
  str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");

// GET /api/services — public, only visible ones, sorted
router.get("/", async (req, res) => {
  try {
    const services = await Service.find({ isVisible: true }).sort({ order: 1, createdAt: 1 });
    res.json(services);
  } catch (err) {
    res.status(500).json({ message: "Failed to load services." });
  }
});

// GET /api/services/all — admin only, includes hidden
router.get("/all", verifyToken, isAdmin, async (req, res) => {
  try {
    const services = await Service.find().sort({ order: 1, createdAt: 1 });
    res.json(services);
  } catch (err) {
    res.status(500).json({ message: "Failed to load services." });
  }
});

// POST /api/services — admin only
router.post("/", verifyToken, isAdmin, upload.single("image"), async (req, res) => {
  try {
    const { title, description, icon, priceLabel, features, isVisible, order } = req.body;
    const slugBase = slugify(title);
    let slug = slugBase;
    let count = 1;
    while (await Service.findOne({ slug })) {
      slug = `${slugBase}-${count++}`;
    }

    const service = await Service.create({
      title,
      slug,
      description,
      icon: icon || "Sparkles",
      image: req.file ? req.file.path : req.body.image || "",
      imagePublicId: req.file ? req.file.filename : "",
      priceLabel,
      features: features ? JSON.parse(features) : [],
      isVisible: isVisible === "false" ? false : true,
      order: order || 0,
    });

    res.status(201).json(service);
  } catch (err) {
    res.status(400).json({ message: err.message || "Failed to create service." });
  }
});

// PUT /api/services/:id — admin only
router.put("/:id", verifyToken, isAdmin, upload.single("image"), async (req, res) => {
  try {
    const updates = { ...req.body };
    if (updates.features) updates.features = JSON.parse(updates.features);
    if (updates.isVisible !== undefined) updates.isVisible = updates.isVisible === "true" || updates.isVisible === true;
    delete updates.imagePublicId;

    const existing = await Service.findById(req.params.id);
    if (!existing) {
      if (req.file) await destroyImage(req.file.filename);
      return res.status(404).json({ message: "Service not found." });
    }

    if (req.file) {
      updates.image = req.file.path;
      updates.imagePublicId = req.file.filename;
    }

    const service = await Service.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });
    if (req.file) await destroyImage(existing.imagePublicId);
    res.json(service);
  } catch (err) {
    res.status(400).json({ message: err.message || "Failed to update service." });
  }
});

// PATCH /api/services/:id/toggle — admin only, quick visibility toggle
router.patch("/:id/toggle", verifyToken, isAdmin, async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) return res.status(404).json({ message: "Service not found." });
    service.isVisible = !service.isVisible;
    await service.save();
    res.json(service);
  } catch (err) {
    res.status(400).json({ message: "Failed to toggle visibility." });
  }
});

// DELETE /api/services/:id — admin only
router.delete("/:id", verifyToken, isAdmin, async (req, res) => {
  try {
    const service = await Service.findByIdAndDelete(req.params.id);
    if (!service) return res.status(404).json({ message: "Service not found." });
    await destroyImage(service.imagePublicId);
    res.json({ message: "Service deleted successfully." });
  } catch (err) {
    res.status(400).json({ message: "Failed to delete service." });
  }
});

module.exports = router;
