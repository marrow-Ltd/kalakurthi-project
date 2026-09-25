const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");

/**
 * verifyToken — checks Authorization: Bearer <jwt>, then confirms the admin still exists in
 * MongoDB and hasn't changed their password since the token was issued.
 */
const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;
    if (!token) return res.status(401).json({ message: "No token provided. Please sign in." });

    const decoded = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ["HS256"] });
    const admin = await Admin.findById(decoded.id).select("username passwordChangedAt");
    if (!admin) return res.status(401).json({ message: "Admin not found. Please sign in again." });

    if (decoded.iat < Math.floor(admin.passwordChangedAt.getTime() / 1000)) {
      return res.status(401).json({ message: "Password was changed. Please sign in again." });
    }

    req.admin = { id: admin._id, username: admin.username, role: "admin" };
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired session. Please sign in again." });
  }
};

/** isAdmin — must run AFTER verifyToken. */
const isAdmin = (req, res, next) => {
  if (!req.admin || req.admin.role !== "admin") {
    return res.status(403).json({ message: "Admins only." });
  }
  next();
};

module.exports = { verifyToken, isAdmin };
