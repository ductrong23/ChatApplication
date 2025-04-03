
const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const cloudinary = require("../configs/cloudinary");

// Cấu hình multer với đường dẫn tuyệt đối
const upload = multer({
  dest: path.join(__dirname, "../uploads"), // Sử dụng đường dẫn tuyệt đối
});

router.route("/").post(upload.single("img"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    console.log("File saved at:", req.file.path);

    const result = await cloudinary.uploader.upload(req.file.path);
    if (!result || !result.secure_url) {
      throw new Error("Cloudinary upload failed: No secure_url returned");
    }

    console.log("Cloudinary URL:", result.secure_url);

    res.status(200).json({
      url: result.secure_url,
    });
  } catch (error) {
    console.error("Error in upload route:", {
      message: error.message || "Unknown error",
      stack: error.stack || "No stack trace",
      rawError: error,
    });
    res.status(500).json({
      message: "Error uploading file to Cloudinary",
      error: error.message || "Unknown error",
    });
  }
});

module.exports = router;