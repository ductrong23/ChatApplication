const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer({ dest: "../uploads" });
const cloudinary = require("../configs/cloudinary");

router.route("/").post(upload.single("img"), async (req, res) => {
  console.log(req.file.path);
  const result = await cloudinary.uploader.upload(req.file.path);
  console.log(result.secure_url);
  res.status(200).json({
    url: result.secure_url,
  });
});
module.exports = router;
