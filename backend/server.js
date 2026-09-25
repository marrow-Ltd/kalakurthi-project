require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const hpp = require("hpp");
const rateLimit = require("express-rate-limit");
const connectDB = require("./config/db");

const adminAuthRoutes = require("./routes/auth");
const serviceRoutes = require("./routes/services");
const galleryRoutes = require("./routes/gallery");
const orderRoutes = require("./routes/orders");
const siteConfigRoutes = require("./routes/siteConfig");
const testimonialRoutes = require("./routes/testimonials");
const slideRoutes = require("./routes/slides");
const categoryRoutes = require("./routes/categories");
const productRoutes = require("./routes/products");

const app = express();

connectDB();

app.set("trust proxy", 1); // correct client IP behind a proxy (Render/Vercel/etc), needed for rate limiting

// --- Security middleware ---
app.use(
  helmet({
    crossOriginResourcePolicy: false, // allow Cloudinary images to be loaded cross-origin by the frontend
  })
);
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173", // only this origin may call the API
  })
);
app.use(express.json({ limit: "1mb" })); // small limit: this API takes text fields, not big JSON payloads
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(mongoSanitize()); // strips `$` / `.` keys from body, query & params — blocks NoSQL operator injection
app.use(hpp()); // collapses duplicate query params (e.g. ?sort=a&sort=b) to stop param-pollution tricks
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

// Generous baseline limiter for the whole public API, on top of the stricter one on /api/admin/login
app.use(
  "/api",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 600,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: "Too many requests. Please slow down and try again shortly." },
  })
);

// API routes
app.use("/api/admin", adminAuthRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/gallery", galleryRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/site-config", siteConfigRoutes);
app.use("/api/testimonials", testimonialRoutes);
app.use("/api/slides", slideRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Kalakruti Artistry API is running 🧵" });
});

// 404 handler
app.use("/api", (req, res) => {
  res.status(404).json({ message: "API route not found." });
});

// Global error handler — never leaks stack traces or internals to the client
app.use((err, req, res, next) => {
  console.error(err.stack);
  if (err.name === "MulterError") err.status = 400; // e.g. file too large / too many files
  if (err.type === "entity.too.large") err.status = 413;
  const status = err.status && err.status >= 400 && err.status < 600 ? err.status : 500;
  const message = status === 500 ? "Something went wrong on the server." : err.message || "Request failed.";
  res.status(status).json({ message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🧵 Kalakruti Artistry server running on port ${PORT}`);
});
