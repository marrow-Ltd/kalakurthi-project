const express = require("express");
const Gallery = require("../models/Gallery");
const { verifyToken, isAdmin } = require("../middleware/auth");
const upload = require("../middleware/upload");
const { destroyImage } = require("../config/cloudinary");

const router = express.Router();

// GET /api/gallery?tag=Crochet — public, visible items only, optional tag filter
router.get("/", async (req, res) => {
  try {
    const filter = { isVisible: true };
    const tag = typeof req.query.tag === "string" ? req.query.tag : "";
    if (tag && tag !== "All") {
      filter.tags = tag;
    }
    const items = await Gallery.find(filter).sort({ order: 1, createdAt: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: "Failed to load gallery." });
  }
});

// GET /api/gallery/tags — public, distinct tag list for filter chips
router.get("/tags", async (req, res) => {
  try {
    const tags = await Gallery.distinct("tags", { isVisible: true });
    res.json(tags);
  } catch (err) {
    res.status(500).json({ message: "Failed to load tags." });
  }
});

// GET /api/gallery/all — admin only
router.get("/all", verifyToken, isAdmin, async (req, res) => {
  try {
    const items = await Gallery.find().sort({ order: 1, createdAt: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: "Failed to load gallery." });
  }
});

// POST /api/gallery — admin only
router.post("/", verifyToken, isAdmin, upload.single("image"), async (req, res) => {
  try {
    const { title, description, tags, isFeatured, isVisible, order } = req.body;
    if (!req.file && !req.body.image) {
      return res.status(400).json({ message: "An image is required." });
    }
    const item = await Gallery.create({
      title,
      description,
      image: req.file ? req.file.path : req.body.image,
      imagePublicId: req.file ? req.file.filename : "",
      tags: tags ? JSON.parse(tags) : [],
      isFeatured: isFeatured === "true" || isFeatured === true,
      isVisible: isVisible === "false" ? false : true,
      order: order || 0,
    });
    res.status(201).json(item);
  } catch (err) {
    res.status(400).json({ message: err.message || "Failed to add gallery item." });
  }
});

// PUT /api/gallery/:id — admin only
router.put("/:id", verifyToken, isAdmin, upload.single("image"), async (req, res) => {
  try {
    // Allow-list: only these fields can ever be written, however the request is shaped
    const b = req.body;
    const updates = {
      ...(b.title !== undefined && { title: b.title }),
      ...(b.description !== undefined && { description: b.description }),
      ...(b.tags !== undefined && { tags: JSON.parse(b.tags) }),
      ...(b.isFeatured !== undefined && { isFeatured: b.isFeatured === "true" || b.isFeatured === true }),
      ...(b.isVisible !== undefined && { isVisible: b.isVisible === "true" || b.isVisible === true }),
      ...(b.order !== undefined && { order: Number(b.order) || 0 }),
    };

    const existing = await Gallery.findById(req.params.id);
    if (!existing) {
      if (req.file) await destroyImage(req.file.filename); // don't orphan the new upload
      return res.status(404).json({ message: "Gallery item not found." });
    }

    if (req.file) {
      updates.image = req.file.path;
      updates.imagePublicId = req.file.filename;
    }

    const item = await Gallery.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });
    if (req.file) await destroyImage(existing.imagePublicId); // remove the replaced image
    res.json(item);
  } catch (err) {
    res.status(400).json({ message: err.message || "Failed to update gallery item." });
  }
});

// DELETE /api/gallery/:id — admin only
router.delete("/:id", verifyToken, isAdmin, async (req, res) => {
  try {
    const item = await Gallery.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ message: "Gallery item not found." });
    await destroyImage(item.imagePublicId);
    res.json({ message: "Gallery item deleted successfully." });
  } catch (err) {
    res.status(400).json({ message: "Failed to delete gallery item." });
  }
});

module.exports = router;
