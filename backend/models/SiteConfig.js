const mongoose = require("mongoose");

// This is a singleton document — there will only ever be ONE SiteConfig record.
const siteConfigSchema = new mongoose.Schema(
  {
    key: { type: String, default: "main", unique: true }, // lock to a single doc

    brandName: { type: String, default: "Kalakruti Artistry" },
    brandTagline: { type: String, default: "stitched with love" },

    heroTitle: { type: String, default: "Threads That Tell Your Story" },
    heroTagline: {
      type: String,
      default: "Hand-embroidered & crocheted keepsakes, stitched with love in every loop.",
    },
    heroImage: { type: String, default: "" },
    heroImagePublicId: { type: String, default: "" },
    heroCtaText: { type: String, default: "Explore Our Craft" },

    announcementText: { type: String, default: "" },
    announcementIsActive: { type: Boolean, default: false },

    instagramHandle: { type: String, default: "@kalakruthi._artistry" },
    instagramUrl: { type: String, default: "https://instagram.com/kalakruthi._artistry" },
    facebookUrl: { type: String, default: "" },
    whatsappNumber: { type: String, default: "917013058527" },

    contactEmail: { type: String, default: "hello@kalakrutiartistry.com" },
    contactPhone: { type: String, default: "" },
    contactAddress: { type: String, default: "" },

    aboutText: {
      type: String,
      default:
        "Kalakruti Artistry is a home-grown atelier where every stitch is placed by hand — blending traditional embroidery techniques with contemporary crochet artistry.",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SiteConfig", siteConfigSchema);
