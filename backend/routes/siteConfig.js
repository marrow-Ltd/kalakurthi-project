const express = require("express");
const SiteConfig = require("../models/SiteConfig");
const { verifyToken, isAdmin } = require("../middleware/auth");
const upload = require("../middleware/upload");
const { destroyImage } = require("../config/cloudinary");

const router = express.Router();

const getOrCreateConfig = async () => {
  let config = await SiteConfig.findOne({ key: "main" });
  if (!config) config = await SiteConfig.create({ key: "main" });

  // One-time tidy-up: older saved text used the Devanagari spelling of the brand name
  if (config.aboutText && config.aboutText.includes("कलाkruti")) {
    config.aboutText = config.aboutText.replace(/कलाkruti ARTISTRY/g, "Kalakruti Artistry").replace(/कलाkruti/g, "Kalakruti");
    await config.save();
  }
  return config;
};

// GET /api/site-config — public
router.get("/", async (req, res) => {
  try {
    const config = await getOrCreateConfig();
    res.json(config);
  } catch (err) {
    res.status(500).json({ message: "Failed to load site configuration." });
  }
});

const SITE_CONFIG_FIELDS = [
  "brandName", "brandTagline",
  "heroTitle", "heroTagline", "heroCtaText",
  "announcementText",
  "instagramHandle", "instagramUrl", "facebookUrl", "whatsappNumber",
  "contactEmail", "contactPhone", "contactAddress",
  "aboutText",
];

// PUT /api/site-config — admin only
router.put("/", verifyToken, isAdmin, upload.single("heroImage"), async (req, res) => {
  try {
    const b = req.body;
    // Allow-list: only known site-settings fields can ever be written
    const updates = {};
    for (const key of SITE_CONFIG_FIELDS) {
      if (b[key] !== undefined) updates[key] = b[key];
    }
    if (b.announcementIsActive !== undefined) {
      updates.announcementIsActive = b.announcementIsActive === "true" || b.announcementIsActive === true;
    }

    const previous = await SiteConfig.findOne({ key: "main" });
    if (req.file) {
      updates.heroImage = req.file.path;
      updates.heroImagePublicId = req.file.filename;
    }

    const config = await SiteConfig.findOneAndUpdate({ key: "main" }, updates, {
      new: true,
      upsert: true,
      runValidators: true,
    });
    if (req.file && previous) await destroyImage(previous.heroImagePublicId);
    res.json(config);
  } catch (err) {
    res.status(400).json({ message: err.message || "Failed to update site configuration." });
  }
});

module.exports = router;
