const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

/**
 * Delete one image from Cloudinary by its public_id.
 * Never throws — a failed cleanup must not block a DB delete/update.
 */
const destroyImage = async (publicId) => {
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId, { invalidate: true });
  } catch (err) {
    console.error(`Cloudinary delete failed for "${publicId}":`, err.message);
  }
};

/** Delete several images in parallel. */
const destroyImages = async (publicIds = []) => {
  await Promise.all(publicIds.filter(Boolean).map(destroyImage));
};

module.exports = { cloudinary, destroyImage, destroyImages };
