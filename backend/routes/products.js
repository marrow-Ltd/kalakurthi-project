const express = require("express");
const mongoose = require("mongoose");
const Product = require("../models/Product");
const Category = require("../models/Category");
const { verifyToken, isAdmin } = require("../middleware/auth");
const upload = require("../middleware/upload");
const { destroyImages } = require("../config/cloudinary");
const { buildProductQuery } = require("../utils/productQuery");
const { slugify, uniqueSlug, toBool, parseList, cleanupUploads } = require("../utils/helpers");

const router = express.Router();
const MAX_IMAGES = 6;

// GET /api/products — public shop listing.
// ?q= &category=slug,slug &color=a,b &minPrice= &maxPrice= &discount=20 &offers=true &inStock=true
// &featured=true &ids=id,id &sort=popular|newest|price_asc|price_desc|discount &page= &limit=
router.get("/", async (req, res) => {
  try {
    let categoryIds;
    if (req.query.category) {
      const slugs = String(req.query.category).split(",").map((s) => s.trim()).filter(Boolean);
      categoryIds = (await Category.find({ slug: { $in: slugs } }).select("_id")).map((c) => c._id);
    }
    const { filter, sort } = buildProductQuery(req.query, { categoryIds });

    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 24, 1), 60);
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);

    const [items, total] = await Promise.all([
      Product.find(filter).sort(sort).skip((page - 1) * limit).limit(limit).populate("category", "name slug"),
      Product.countDocuments(filter),
    ]);
    res.json({ items, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: "Failed to load products." });
  }
});

// GET /api/products/filters — public, options for the shop filter panel
router.get("/filters", async (req, res) => {
  try {
    const visible = { isVisible: true };
    const [priceAgg, colors, catCounts, categories] = await Promise.all([
      Product.aggregate([
        { $match: visible },
        { $group: { _id: null, min: { $min: "$price" }, max: { $max: "$price" }, maxDiscount: { $max: "$discountPercent" } } },
      ]),
      Product.distinct("colors", visible),
      Product.aggregate([{ $match: { ...visible, category: { $ne: null } } }, { $group: { _id: "$category", count: { $sum: 1 } } }]),
      Category.find({ isVisible: true }).sort({ order: 1, createdAt: 1 }).select("name slug"),
    ]);

    const counts = Object.fromEntries(catCounts.map((c) => [String(c._id), c.count]));
    res.json({
      price: { min: priceAgg[0]?.min ?? 0, max: priceAgg[0]?.max ?? 0 },
      maxDiscount: priceAgg[0]?.maxDiscount ?? 0,
      colors: colors.filter(Boolean).sort((a, b) => a.localeCompare(b)),
      categories: categories.map((c) => ({ _id: c._id, name: c.name, slug: c.slug, count: counts[String(c._id)] || 0 })),
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to load filters." });
  }
});

// GET /api/products/all — admin, includes hidden
router.get("/all", verifyToken, isAdmin, async (req, res) => {
  try {
    res.json(await Product.find().sort({ order: 1, createdAt: -1 }).populate("category", "name slug"));
  } catch (err) {
    res.status(500).json({ message: "Failed to load products." });
  }
});

// GET /api/products/:idOrSlug — public product page
router.get("/:idOrSlug", async (req, res) => {
  try {
    const { idOrSlug } = req.params;
    const query = mongoose.isValidObjectId(idOrSlug) ? { _id: idOrSlug } : { slug: idOrSlug };
    const product = await Product.findOne({ ...query, isVisible: true }).populate("category", "name slug");
    if (!product) return res.status(404).json({ message: "Product not found." });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: "Failed to load product." });
  }
});

const fieldsFromBody = (b) => ({
  name: b.name,
  description: b.description || "",
  category: b.category || null,
  price: Number(b.price),
  mrp: Number(b.mrp) || 0,
  colors: parseList(b.colors),
  tags: parseList(b.tags),
  isAvailable: toBool(b.isAvailable, true),
  isFeatured: toBool(b.isFeatured, false),
  isVisible: toBool(b.isVisible, true),
  order: Number(b.order) || 0,
});

const toImages = (files = []) => files.map((f) => ({ url: f.path, publicId: f.filename }));

// POST /api/products — admin (up to 6 images in field "images")
router.post("/", verifyToken, isAdmin, upload.array("images", MAX_IMAGES), async (req, res) => {
  try {
    if (!req.body.name || !req.body.name.trim()) {
      await cleanupUploads(req);
      return res.status(400).json({ message: "Product name is required." });
    }
    const slug = await uniqueSlug(Product, slugify(req.body.name));
    const product = await Product.create({ ...fieldsFromBody(req.body), slug, images: toImages(req.files) });
    res.status(201).json(product);
  } catch (err) {
    await cleanupUploads(req);
    res.status(400).json({ message: err.message || "Failed to create product." });
  }
});

// PUT /api/products/:id — admin.
// `keepImageIds` (JSON array of publicIds) says which existing images stay; new uploads are appended.
router.put("/:id", verifyToken, isAdmin, upload.array("images", MAX_IMAGES), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      await cleanupUploads(req);
      return res.status(404).json({ message: "Product not found." });
    }

    let kept = product.images.map((i) => ({ url: i.url, publicId: i.publicId }));
    if (req.body.keepImageIds !== undefined) {
      const keepIds = parseList(req.body.keepImageIds);
      kept = kept.filter((i) => keepIds.includes(i.publicId));
    }
    const removed = product.images.filter((i) => !kept.some((k) => k.publicId === i.publicId));
    const added = toImages(req.files);

    if (kept.length + added.length > MAX_IMAGES) {
      await cleanupUploads(req);
      return res.status(400).json({ message: `A product can have at most ${MAX_IMAGES} images.` });
    }

    product.set({ ...fieldsFromBody(req.body), images: [...kept, ...added] });
    await product.save();
    await destroyImages(removed.map((i) => i.publicId));
    res.json(product);
  } catch (err) {
    await cleanupUploads(req);
    res.status(400).json({ message: err.message || "Failed to update product." });
  }
});

// PATCH /api/products/:id/toggle — admin, quick show/hide
router.patch("/:id/toggle", verifyToken, isAdmin, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found." });
    product.isVisible = !product.isVisible;
    await product.save();
    res.json(product);
  } catch (err) {
    res.status(400).json({ message: "Failed to toggle visibility." });
  }
});

// DELETE /api/products/:id — admin (also removes all its images from Cloudinary)
router.delete("/:id", verifyToken, isAdmin, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found." });
    await destroyImages(product.images.map((i) => i.publicId));
    res.json({ message: "Product deleted." });
  } catch (err) {
    res.status(400).json({ message: "Failed to delete product." });
  }
});

module.exports = router;
