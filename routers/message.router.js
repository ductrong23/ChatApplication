// routers/message.router.js
const express = require("express");
const messageController = require("../controllers/message.controller");
const router = express.Router();

// Route lưu tin nhắn
router.post("/", messageController.saveMessage);

// Route lấy tất cả tin nhắn trong phòng chat
router.get("/:room", messageController.getMessagesByRoom);

module.exports = router;
