// routers/message.router.js
const express = require("express");
const messageController = require("../controllers/message.controller");
const router = express.Router();

// Route lưu tin nhắn
router.post("/", messageController.saveMessage);

// Route lấy tất cả tin nhắn trong phòng chat
router.get("/:room", messageController.getMessagesByRoom);

// Route xử lý báo cáo từ nhạy cảm
router.post("/report-sensitive", messageController.reportSensitiveWord);
router.post("/blacklist-sensitive", messageController.blacklistSensitiveWord);

module.exports = router;
