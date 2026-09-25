const { destroyImages } = require("../config/cloudinary");

const slugify = (str = "") =>
  String(str)
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-") || "item";

/** Find a slug that isn't used yet (name, name-1, name-2 ...) */
const uniqueSlug = async (Model, base, excludeId) => {
  let slug = base;
  let n = 1;
  const clash = (s) => Model.findOne({ slug: s, ...(excludeId ? { _id: { $ne: excludeId } } : {}) });
  while (await clash(slug)) slug = `${base}-${n++}`;
  return slug;
};

const toBool = (v, fallback) => (v === undefined ? fallback : v === true || v === "true");

/** Accepts a JSON array string, a real array, or "a, b, c" */
const parseList = (v) => {
  if (v === undefined || v === null || v === "") return [];
  if (Array.isArray(v)) return v.map((s) => String(s).trim()).filter(Boolean);
  try {
    const parsed = JSON.parse(v);
    if (Array.isArray(parsed)) return parsed.map((s) => String(s).trim()).filter(Boolean);
  } catch {
    /* not JSON — fall through to comma split */
  }
  return String(v).split(",").map((s) => s.trim()).filter(Boolean);
};

const hexOr = (v, fallback) => (/^#[0-9a-fA-F]{6}$/.test(v || "") ? v : fallback);

/** Remove files that were already uploaded to Cloudinary when a request then fails */
const cleanupUploads = (req) =>
  destroyImages([...(req.file ? [req.file] : []), ...(req.files || [])].map((f) => f.filename));

module.exports = { slugify, uniqueSlug, toBool, parseList, hexOr, cleanupUploads };
