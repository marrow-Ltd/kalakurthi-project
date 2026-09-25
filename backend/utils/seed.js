/**
 * Run with: npm run seed
 * Populates initial Services, Categories, Slides, demo Products, SiteConfig, and Testimonials so the
 * user panel isn't empty on first run. Safe to re-run (it upserts).
 */
require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const Service = require("../models/Service");
const SiteConfig = require("../models/SiteConfig");
const Testimonial = require("../models/Testimonial");
const Gallery = require("../models/Gallery");
const Category = require("../models/Category");
const Slide = require("../models/Slide");
const Product = require("../models/Product");

const services = [
  {
    title: "Photo Embroidery",
    slug: "photo-embroidery",
    description: "Turn your favourite photograph into a hand-stitched keepsake, thread by thread.",
    icon: "Image",
    priceLabel: "Starting from ₹1,299",
    features: ["Hoop or framed finish", "Custom sizing", "2–3 week turnaround"],
    order: 1,
  },
  {
    title: "Cloth Embroidery",
    slug: "cloth-embroidery",
    description: "Personalised embroidery on sarees, kurtas, dupattas and more — your fabric, our needle.",
    icon: "Shirt",
    priceLabel: "Starting from ₹799",
    features: ["Bring your own fabric", "Traditional & modern motifs", "Colour-matched threads"],
    order: 2,
  },
  {
    title: "Crochet Items",
    slug: "crochet-items",
    description: "Cozy, handmade crochet bags, coasters, toys and wearables — made loop by loop.",
    icon: "Heart",
    priceLabel: "Starting from ₹599",
    features: ["100% handmade", "Custom colours", "Eco-friendly yarn options"],
    order: 3,
  },
  {
    title: "Canvas Creations",
    slug: "canvas-creations",
    description: "Statement embroidery art on canvas, ready to hang and treasure for years to come.",
    icon: "Frame",
    priceLabel: "Starting from ₹1,999",
    features: ["Gallery-ready framing", "Large format available", "One-of-a-kind designs"],
    order: 4,
  },
];

const testimonials = [
  {
    customerName: "Ananya R.",
    message: "The photo embroidery hoop I ordered was breathtaking — every stitch felt personal.",
    rating: 5,
    order: 1,
  },
  {
    customerName: "Priya S.",
    message: "My crochet bag gets compliments everywhere I go. Truly artisan quality!",
    rating: 5,
    order: 2,
  },
];

const categories = [
  { name: "Embroidery", slug: "embroidery", tagline: "Hand-stitched hoops & wall art", icon: "Frame", color: "#F6D9DC", order: 1 },
  { name: "Crochet", slug: "crochet", tagline: "Bags, toys & cozy wearables", icon: "Heart", color: "#F8E4D2", order: 2 },
  { name: "Accessories", slug: "accessories", tagline: "Scrunchies, keychains & more", icon: "Sparkles", color: "#E3EBDD", order: 3 },
  { name: "Gifts", slug: "gifts", tagline: "Made-to-order keepsakes", icon: "Gift", color: "#EADCF0", order: 4 },
  { name: "Home Decor", slug: "home-decor", tagline: "Coasters, frames & florals", icon: "Flower2", color: "#DCE8F0", order: 5 },
];

const slides = [
  { title: "Threads That Tell Your Story", subtitle: "Hand-embroidered & crocheted keepsakes, stitched with love.", badge: "Handcrafted", ctaText: "Shop Now", ctaLink: "/shop", bgFrom: "#6A1B38", bgTo: "#C86D51", textTheme: "light", order: 1 },
  { title: "Festive Gifting, Made By Hand", subtitle: "Personalised pieces for every celebration.", badge: "Festive Season", ctaText: "Explore Gifts", ctaLink: "/shop?category=gifts", bgFrom: "#C86D51", bgTo: "#F2C9A0", textTheme: "dark", order: 2 },
  { title: "Your Idea, Our Needle", subtitle: "Send a photo or a sketch and we will stitch it.", badge: "Custom Orders", ctaText: "Start a Custom Order", ctaLink: "/custom-order", bgFrom: "#5F6F52", bgTo: "#A9B79A", textTheme: "light", order: 3 },
];

// Demo products so the shop isn't empty on first run. Replace them with real ones (and real photos) in the Admin Panel.
const demoProducts = [
  { name: "Floral Hoop Art", category: "embroidery", price: 899, mrp: 1199, colors: ["Pink", "Ivory"], isFeatured: true },
  { name: "Crochet Sunflower Bag", category: "crochet", price: 1299, mrp: 1599, colors: ["Yellow", "Green"], isFeatured: true },
  { name: "Crochet Scrunchie Set", category: "accessories", price: 249, mrp: 0, colors: ["Peach", "Lilac", "Mint"], isFeatured: true },
  { name: "Custom Name Keychain", category: "gifts", price: 199, mrp: 299, colors: ["Red", "Blue"], isFeatured: false },
  { name: "Embroidered Coaster Set", category: "home-decor", price: 549, mrp: 0, colors: ["Cream"], isFeatured: true },
  { name: "Handmade Flower Bouquet", category: "home-decor", price: 749, mrp: 999, colors: ["Red", "Pink"], isFeatured: false },
];

const run = async () => {
  await connectDB();

  for (const s of services) {
    await Service.findOneAndUpdate({ slug: s.slug }, s, { upsert: true, new: true });
  }
  console.log(`✅ Seeded ${services.length} services`);

  await SiteConfig.findOneAndUpdate(
    { key: "main" },
    {
      key: "main",
      heroTitle: "Threads That Tell Your Story",
      heroTagline: "Hand-embroidered & crocheted keepsakes, stitched with love in every loop.",
      heroCtaText: "Explore Our Craft",
      whatsappNumber: process.env.BUSINESS_WHATSAPP_NUMBER || "917013058527",
      brandName: "Kalakruti Artistry",
      instagramHandle: "@kalakruthi._artistry",
      instagramUrl: "https://instagram.com/kalakruthi._artistry",
      announcementText: "✨ Festive season pre-orders now open — book your slot!",
      announcementIsActive: true,
    },
    { upsert: true, new: true }
  );
  console.log("✅ Seeded site configuration");

  for (const t of testimonials) {
    await Testimonial.findOneAndUpdate({ customerName: t.customerName }, t, { upsert: true, new: true });
  }
  console.log(`✅ Seeded ${testimonials.length} testimonials`);

  for (const c of categories) {
    await Category.findOneAndUpdate({ slug: c.slug }, c, { upsert: true, new: true });
  }
  console.log(`✅ Seeded ${categories.length} categories`);

  // Slides & products are only created on a fresh database so re-running never overwrites your edits
  if ((await Slide.countDocuments()) === 0) {
    await Slide.insertMany(slides);
    console.log(`✅ Seeded ${slides.length} hero slides`);
  }
  if ((await Product.countDocuments()) === 0) {
    const cats = await Category.find();
    const bySlug = Object.fromEntries(cats.map((c) => [c.slug, c._id]));
    for (const [i, p] of demoProducts.entries()) {
      const slugBase = p.name.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-");
      await Product.create({
        ...p,
        slug: slugBase,
        category: bySlug[p.category],
        description: "Demo product — replace this with your real product details and photos in the Admin Panel.",
        order: i + 1,
      });
    }
    console.log(`✅ Seeded ${demoProducts.length} demo products`);
  }

  console.log("🎉 Seeding complete. You can now add real photos via the Admin Panel.");
  await mongoose.connection.close();
  process.exit(0);
};

run().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
