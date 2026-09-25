const express = require("express");
const Category = require("../models/Category");
const Product = require("../models/Product");
const { verifyToken, isAdmin } = require("../middleware/auth");
const upload = require("../middleware/upload");
const { destroyImage } = require("../config/cloudinary");
const { slugify, uniqueSlug, toBool, hexOr, cleanupUploads } = require("../utils/helpers");

const router = express.Router();

// GET /api/categories — public
router.get("/", async (req, res) => {
  try {
    res.json(await Category.find({ isVisible: true }).sort({ order: 1, createdAt: 1 }));
  } catch (err) {
    res.status(500).json({ message: "Failed to load categories." });
  }
});

// GET /api/categories/all — admin, includes hidden
router.get("/all", verifyToken, isAdmin, async (req, res) => {
  try {
    res.json(await Category.find().sort({ order: 1, createdAt: 1 }));
  } catch (err) {
    res.status(500).json({ message: "Failed to load categories." });
  }
});

// PATCH /api/categories/reorder — admin, body: { ids: [...] } in the new order
router.patch("/reorder", verifyToken, isAdmin, async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids)) return res.status(400).json({ message: "ids must be an array." });
    await Category.bulkWrite(ids.map((id, i) => ({ updateOne: { filter: { _id: id }, update: { $set: { order: i + 1 } } } })));
    res.json({ message: "Order saved." });
  } catch (err) {
    res.status(400).json({ message: "Failed to save order." });
  }
});

const fieldsFromBody = (b) => ({
  name: b.name,
  tagline: b.tagline || "",
  icon: b.icon || "Sparkles",
  color: hexOr(b.color, "#F6D9DC"),
  isVisible: toBool(b.isVisible, true),
});

// POST /api/categories — admin
router.post("/", verifyToken, isAdmin, upload.single("image"), async (req, res) => {
  try {
    if (!req.body.name || !req.body.name.trim()) {
      await cleanupUploads(req);
      return res.status(400).json({ message: "Category name is required." });
    }
    const slug = await uniqueSlug(Category, slugify(req.body.name));
    const count = await Category.countDocuments();
    const category = await Category.create({
      ...fieldsFromBody(req.body),
      slug,
      image: req.file ? req.file.path : "",
      imagePublicId: req.file ? req.file.filename : "",
      order: count + 1,
    });
    res.status(201).json(category);
  } catch (err) {
    await cleanupUploads(req);
    res.status(400).json({ message: err.message || "Failed to create category." });
  }
});

// PUT /api/categories/:id — admin (slug stays the same so shop links keep working)
router.put("/:id", verifyToken, isAdmin, upload.single("image"), async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      await cleanupUploads(req);
      return res.status(404).json({ message: "Category not found." });
    }

    const oldPublicId = category.imagePublicId;
    category.set(fieldsFromBody(req.body));

    let replacedImage = false;
    if (req.file) {
      category.image = req.file.path;
      category.imagePublicId = req.file.filename;
      replacedImage = true;
    } else if (req.body.removeImage === "true") {
      category.image = "";
      category.imagePublicId = "";
      replacedImage = true;
    }

    await category.save();
    if (replacedImage) await destroyImage(oldPublicId);
    res.json(category);
  } catch (err) {
    await cleanupUploads(req);
    res.status(400).json({ message: err.message || "Failed to update category." });
  }
});

// PATCH /api/categories/:id/toggle — admin
router.patch("/:id/toggle", verifyToken, isAdmin, async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ message: "Category not found." });
    category.isVisible = !category.isVisible;
    await category.save();
    res.json(category);
  } catch (err) {
    res.status(400).json({ message: "Failed to toggle visibility." });
  }
});

// DELETE /api/categories/:id — admin. Products in it stay, they just become uncategorised.
router.delete("/:id", verifyToken, isAdmin, async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) return res.status(404).json({ message: "Category not found." });
    await Product.updateMany({ category: category._id }, { $set: { category: null } });
    await destroyImage(category.imagePublicId);
    res.json({ message: "Category deleted." });
  } catch (err) {
    res.status(400).json({ message: "Failed to delete category." });
  }
});

module.exports = router;
