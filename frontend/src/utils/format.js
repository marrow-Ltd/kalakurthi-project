export const formatPrice = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

export const DEFAULT_BRAND = "Kalakruti Artistry";

/** "Kalakruti Artistry" -> ["Kalakruti", "Artistry"] (first word / rest, styled differently in the logo) */
export const splitBrand = (name = DEFAULT_BRAND) => {
  const parts = String(name).trim().split(/\s+/);
  return [parts[0] || DEFAULT_BRAND, parts.slice(1).join(" ")];
};

/** Cloudinary delivery URL tweak: smaller, auto-format/quality images. Leaves other URLs untouched. */
export const optimizeImage = (url, width = 600) => {
  if (!url || !url.includes("res.cloudinary.com") || !url.includes("/upload/")) return url;
  return url.replace("/upload/", `/upload/f_auto,q_auto,w_${width},c_limit/`);
};
