// controllers/message.controller.js
const messageModel = require("../models/message.model");
const sensitiveWordModel = require("../models/sensitiveWord.model");
const mongoose = require("mongoose");

module.exports = {
  saveMessage: async (req, res) => {
    try {
      const { room, sender, message, emotion } = req.body;
      // Lưu tin nhắn vào database
      const newMessage = await messageModel.create({
        room,
        sender,
        message,
        emotion,
      });

      // Trả về tin nhắn đã lưu
      return res.status(201).json(newMessage);
    } catch (error) {
      return res.status(500).json({ message: "Error saving message", error });
    }
  },

  getMessagesByRoom: async (req, res) => {
    try {
      const { room } = req.params;
      // Lấy tất cả tin nhắn trong phòng chat
      const messages = await messageModel.find({ room }).sort({ timestamp: 1 });
      return res.status(200).json(messages);
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Error retrieving message", error });
    }
  },

  // Hàm xử lý báo cáo từ nhạy cảm
  reportSensitiveWord: async (req, res) => {
    try {
      const { messageId, sensitiveWord, reporter } = req.body;

      // Kiểm tra dữ liệu đầu vào
      if (!messageId || !sensitiveWord || !reporter) {
        console.log("Missing required fields:", {
          messageId,
          sensitiveWord,
          reporter,
        });
        return res
          .status(400)
          .json({
            message:
              "Missing required fields: messageId, sensitiveWord, and reporter are required",
          });
      }

      // Log dữ liệu nhận được
      console.log("Received report request:", {
        messageId,
        sensitiveWord,
        reporter,
      });

      // Kiểm tra messageId có hợp lệ không
      if (!mongoose.Types.ObjectId.isValid(messageId)) {
        console.log("Invalid messageId format:", messageId);
        return res.status(400).json({ message: "Invalid messageId format" });
      }

      // Kiểm tra tin nhắn tồn tại
      const message = await messageModel.findById(messageId);
      if (!message) {
        console.log("Message not found for ID:", messageId);
        return res.status(404).json({ message: "Message not found" });
      }

      // Kiểm tra từ nhạy cảm đã được báo cáo chưa
      const existingReport = await sensitiveWordModel.findOne({
        word: sensitiveWord,
      });
      if (existingReport) {
        console.log("Word already reported:", sensitiveWord);
        return res
          .status(400)
          .json({ message: "This word has already been reported" });
      }

      // Lưu từ nhạy cảm vào database
      const newReport = await sensitiveWordModel.create({
        word: sensitiveWord,
        reportedBy: reporter,
        messageId,
      });
      console.log("New report created successfully:", newReport);

      return res
        .status(201)
        .json({
          message: "Sensitive word reported successfully",
          report: newReport,
        });
    } catch (error) {
      console.error("Error in reportSensitiveWord:", {
        message: error.message,
        stack: error.stack,
        requestBody: req.body,
      });
      return res
        .status(500)
        .json({
          message: "Error reporting sensitive word",
          error: error.message,
        });
    }
  },

  blacklistSensitiveWord: async (req, res) => {
    try {
      const { wordId } = req.body;
  
      if (!wordId) {
        console.log("Missing wordId in blacklist request");
        return res.status(400).json({ message: "Missing wordId" });
      }
  
      const sensitiveWord = await sensitiveWordModel.findById(wordId);
      if (!sensitiveWord) {
        console.log("Sensitive word not found for ID:", wordId);
        return res.status(404).json({ message: "Sensitive word not found" });
      }
  
      sensitiveWord.status = "blacklisted";
      await sensitiveWord.save();
      console.log("Word blacklisted successfully:", sensitiveWord);
  
      return res.status(200).json({ message: "Word added to blacklist", word: sensitiveWord });
    } catch (error) {
      console.error("Error in blacklistSensitiveWord:", {
        message: error.message,
        stack: error.stack,
        requestBody: req.body,
      });
      return res.status(500).json({ message: "Error blacklisting word", error: error.message });
    }
  },
};
