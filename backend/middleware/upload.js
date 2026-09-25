const multer = require("multer");
const path = require("path");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const { cloudinary } = require("../config/cloudinary");

const baseFolder = process.env.CLOUDINARY_FOLDER || "kalakruti-artistry";
const ALLOWED_EXT = /jpeg|jpg|png|webp|gif/;
const ALLOWED_MIME = /^image\/(jpeg|png|webp|gif)$/;

// Files go straight to Cloudinary (no local disk).
// After upload: req.file.path = secure URL, req.file.filename = public_id.
const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder: `${baseFolder}/${file.fieldname}`,
    allowed_formats: ["jpg", "jpeg", "png", "webp", "gif"],
    resource_type: "image",
  }),
});

// Check both the file extension AND the declared MIME type — an attacker renaming a
// script to "photo.jpg" still sends the real content-type, which this rejects.
const fileFilter = (req, file, cb) => {
  const extOk = ALLOWED_EXT.test(path.extname(file.originalname).toLowerCase());
  const mimeOk = ALLOWED_MIME.test(file.mimetype);
  if (extOk && mimeOk) return cb(null, true);
  cb(new Error("Only image files (jpg, jpeg, png, webp, gif) are allowed."));
};

const maxSizeMb = parseInt(process.env.MAX_UPLOAD_SIZE_MB || "5", 10);

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: maxSizeMb * 1024 * 1024, files: 6 }, // hard cap: at most 6 files per request
});

module.exports = upload;
