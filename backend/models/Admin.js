const mongoose = require("mongoose");

// Admin login stored in MongoDB Atlas. Only a salted scrypt hash is kept — never the password itself.
const adminSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    passwordChangedAt: { type: Date, default: Date.now }, // tokens issued before this are rejected
  },
  { timestamps: true }
);

module.exports = mongoose.model("Admin", adminSchema);
