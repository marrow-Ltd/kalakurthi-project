const express = require("express");
const Slide = require("../models/Slide");
const { verifyToken, isAdmin } = require("../middleware/auth");
const upload = require("../middleware/upload");
const { destroyImage } = require("../config/cloudinary");
const { toBool, hexOr, cleanupUploads } = require("../utils/helpers");

const router = express.Router();

// GET /api/slides — public, visible slides in order
router.get("/", async (req, res) => {
  try {
    res.json(await Slide.find({ isVisible: true }).sort({ order: 1, createdAt: 1 }));
  } catch (err) {
    res.status(500).json({ message: "Failed to load slides." });
  }
});

// GET /api/slides/all — admin, includes hidden
router.get("/all", verifyToken, isAdmin, async (req, res) => {
  try {
    res.json(await Slide.find().sort({ order: 1, createdAt: 1 }));
  } catch (err) {
    res.status(500).json({ message: "Failed to load slides." });
  }
});

// PATCH /api/slides/reorder — admin, body: { ids: [...] } in the new order
router.patch("/reorder", verifyToken, isAdmin, async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids)) return res.status(400).json({ message: "ids must be an array." });
    await Slide.bulkWrite(ids.map((id, i) => ({ updateOne: { filter: { _id: id }, update: { $set: { order: i + 1 } } } })));
    res.json({ message: "Order saved." });
  } catch (err) {
    res.status(400).json({ message: "Failed to save order." });
  }
});

const fieldsFromBody = (b) => ({
  title: b.title,
  subtitle: b.subtitle || "",
  badge: b.badge || "",
  ctaText: b.ctaText || "Shop Now",
  ctaLink: b.ctaLink || "/shop",
  bgFrom: hexOr(b.bgFrom, "#6A1B38"),
  bgTo: hexOr(b.bgTo, "#C86D51"),
  textTheme: b.textTheme === "dark" ? "dark" : "light",
  isVisible: toBool(b.isVisible, true),
});

// POST /api/slides — admin
router.post("/", verifyToken, isAdmin, upload.single("image"), async (req, res) => {
  try {
    const count = await Slide.countDocuments();
    const slide = await Slide.create({
      ...fieldsFromBody(req.body),
      image: req.file ? req.file.path : "",
      imagePublicId: req.file ? req.file.filename : "",
      order: count + 1,
    });
    res.status(201).json(slide);
  } catch (err) {
    await cleanupUploads(req);
    res.status(400).json({ message: err.message || "Failed to create slide." });
  }
});

// PUT /api/slides/:id — admin
router.put("/:id", verifyToken, isAdmin, upload.single("image"), async (req, res) => {
  try {
    const slide = await Slide.findById(req.params.id);
    if (!slide) {
      await cleanupUploads(req);
      return res.status(404).json({ message: "Slide not found." });
    }

    const oldPublicId = slide.imagePublicId;
    slide.set(fieldsFromBody(req.body));

    let replacedImage = false;
    if (req.file) {
      slide.image = req.file.path;
      slide.imagePublicId = req.file.filename;
      replacedImage = true;
    } else if (req.body.removeImage === "true") {
      slide.image = "";
      slide.imagePublicId = "";
      replacedImage = true;
    }

    await slide.save();
    if (replacedImage) await destroyImage(oldPublicId);
    res.json(slide);
  } catch (err) {
    await cleanupUploads(req);
    res.status(400).json({ message: err.message || "Failed to update slide." });
  }
});

// PATCH /api/slides/:id/toggle — admin, quick show/hide
router.patch("/:id/toggle", verifyToken, isAdmin, async (req, res) => {
  try {
    const slide = await Slide.findById(req.params.id);
    if (!slide) return res.status(404).json({ message: "Slide not found." });
    slide.isVisible = !slide.isVisible;
    await slide.save();
    res.json(slide);
  } catch (err) {
    res.status(400).json({ message: "Failed to toggle visibility." });
  }
});

// DELETE /api/slides/:id — admin (also removes the image from Cloudinary)
router.delete("/:id", verifyToken, isAdmin, async (req, res) => {
  try {
    const slide = await Slide.findByIdAndDelete(req.params.id);
    if (!slide) return res.status(404).json({ message: "Slide not found." });
    await destroyImage(slide.imagePublicId);
    res.json({ message: "Slide deleted." });
  } catch (err) {
    res.status(400).json({ message: "Failed to delete slide." });
  }
});

module.exports = router;
