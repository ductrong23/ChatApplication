const express = require("express");
const router = express.Router();
const { renderChat } = require("../controllers/view.controller");
const sensitiveWordModel = require("../models/sensitiveWord.model");

router.route("/login").get((req, res) => {
  res.render("login.ejs");
});

router
.route("/chat")
// .get((req, res) => {
//   return res.render("chat.ejs");
// });
.get(renderChat)

// Route mới cho trang admin
router.route("/admin").get(async (req, res) => {
  try {
    const pendingWords = await sensitiveWordModel.find({ status: "pending" }).populate("messageId", "message sender");
    res.render("admin.ejs", { pendingWords });
  } catch (error) {
    console.error("Error fetching pending words:", error);
    res.status(500).send("Error loading admin page");
  }
});

const isAdmin = (req, res, next) => {
  const username = req.query.username; // Giả sử lấy từ query, bạn có thể dùng session hoặc token
  if (username !== "admin") { // Thay "admin" bằng username admin thực tế
    return res.status(403).send("Access denied");
  }
  next();
};

router.route("/admin").get(isAdmin, async (req, res) => {
  const pendingWords = await sensitiveWordModel.find({ status: "pending" }).populate("messageId", "message sender");
  res.render("admin.ejs", { pendingWords });
});

module.exports = router;
