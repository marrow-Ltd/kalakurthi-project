const mongoose = require("mongoose");

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const list = (v) => (v === undefined || v === "" ? [] : String(v).split(",").map((s) => s.trim()).filter(Boolean));
const num = (v) => (v === undefined || v === "" || !Number.isFinite(Number(v)) ? undefined : Number(v));

const SORTS = {
  popular: { isFeatured: -1, order: 1, createdAt: -1 },
  newest: { createdAt: -1 },
  price_asc: { price: 1 },
  price_desc: { price: -1 },
  discount: { discountPercent: -1, createdAt: -1 },
};

/**
 * Turns shop query-string params into a MongoDB filter + sort.
 * `categoryIds` are resolved from category slugs by the route (pass [] when slugs matched nothing).
 */
const buildProductQuery = (q = {}, { categoryIds } = {}) => {
  const filter = { isVisible: true };

  const text = q.q ? String(q.q).trim() : "";
  if (text) {
    const rx = new RegExp(escapeRegex(text), "i");
    filter.$or = [{ name: rx }, { description: rx }, { tags: rx }, { colors: rx }];
  }

  if (categoryIds) filter.category = { $in: categoryIds };

  const colors = list(q.color);
  if (colors.length) filter.colors = { $in: colors.map((c) => new RegExp(`^${escapeRegex(c)}$`, "i")) };

  const min = num(q.minPrice);
  const max = num(q.maxPrice);
  if (min !== undefined || max !== undefined) {
    filter.price = {};
    if (min !== undefined) filter.price.$gte = min;
    if (max !== undefined) filter.price.$lte = max;
  }

  const discount = num(q.discount);
  if (discount !== undefined) filter.discountPercent = { $gte: discount };
  else if (q.offers === "true") filter.discountPercent = { $gt: 0 };

  if (q.inStock === "true") filter.isAvailable = true;
  if (q.featured === "true") filter.isFeatured = true;

  const ids = list(q.ids).filter((id) => mongoose.isValidObjectId(id));
  if (q.ids !== undefined) filter._id = { $in: ids };

  return { filter, sort: SORTS[q.sort] || SORTS.popular };
};

module.exports = { buildProductQuery, SORTS };
