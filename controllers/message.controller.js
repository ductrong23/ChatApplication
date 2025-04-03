// controllers/message.controller.js
const messageModel = require("../models/message.model");

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
      return res.status(500).json({ message: "Error retrieving message", error });
    }
  },
};
