import multer from "multer";

// Store file in memory (not local disk)
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // max 5MB
});

export default upload;