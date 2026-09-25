const express = require("express");
const jwt = require("jsonwebtoken");
const rateLimit = require("express-rate-limit");
const Admin = require("../models/Admin");
const { verifyToken, isAdmin } = require("../middleware/auth");
const { hashPassword, verifyPassword, DUMMY_HASH } = require("../utils/password");

const router = express.Router();

// Slow down password guessing: 10 attempts / 15 min / IP
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many login attempts. Please try again in a few minutes." },
});

const signToken = (admin) =>
  jwt.sign({ id: admin._id, role: "admin" }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    algorithm: "HS256",
  });

/**
 * POST /api/admin/login   Body: { username, password }
 * Credentials live in the MongoDB "admins" collection (create one with `npm run create-admin`).
 */
router.post("/login", loginLimiter, async (req, res) => {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required." });
    }

    const admin = await Admin.findOne({ username: String(username).trim().toLowerCase() });
    const ok = verifyPassword(String(password), admin ? admin.passwordHash : DUMMY_HASH);
    if (!admin || !ok) {
      return res.status(401).json({ message: "Incorrect username or password." });
    }

    res.json({ token: signToken(admin), username: admin.username });
  } catch (err) {
    console.error("Login error:", err.message);
    res.status(500).json({ message: "Login failed. Please try again." });
  }
});

/** GET /api/admin/verify — validates a stored token on page load */
router.get("/verify", verifyToken, isAdmin, (req, res) => {
  res.json({ ok: true, username: req.admin.username });
});

/**
 * PUT /api/admin/password   Body: { currentPassword, newPassword }
 * Returns a fresh token; older tokens stop working.
 */
router.put("/password", verifyToken, isAdmin, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body || {};
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Current and new password are required." });
    }
    if (String(newPassword).length < 8) {
      return res.status(400).json({ message: "New password must be at least 8 characters." });
    }

    const admin = await Admin.findById(req.admin.id);
    if (!admin || !verifyPassword(String(currentPassword), admin.passwordHash)) {
      return res.status(401).json({ message: "Current password is incorrect." });
    }

    admin.passwordHash = hashPassword(String(newPassword));
    admin.passwordChangedAt = new Date();
    await admin.save();

    res.json({ message: "Password updated.", token: signToken(admin) });
  } catch (err) {
    console.error("Password change error:", err.message);
    res.status(500).json({ message: "Failed to update password." });
  }
});

module.exports = router;
