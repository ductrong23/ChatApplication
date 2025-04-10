// models/message.model.js
const mongoose = require("mongoose");

const messageSchema = mongoose.Schema(
  {
    room: {
      // Phòng chat mà tin nhắn thuộc về
      type: String,
      required: true,
    },
    sender: {
      // Người gửi
      type: String,
      required: true,
    },
    message: {
      // Nội dung tin nhắn
      type: String,
      required: true,
    },
    avatar: {
      type: String, // Lưu avatar của người gửi
      default: "https://via.placeholder.com/50",
    },
    scheduledTime: {
      type: String, // Lưu thời gian dạng "HH:MM"
      default: null,
    },
    timestamp: {
      // Thời gian gửi tin nhắn
      type: Date,
      default: Date.now,
    },
    emotion: {
      type: Number, // Lưu ID của emotion (1, 2, 3, 4)
      required: false, // Không bắt buộc vì không phải tin nhắn nào cũng có emotion
      default: null, // Giá trị mặc định là null nếu không có emotion
    },
  },
  {
    versionKey: false,
    timestamps: true, // Thêm thời gian tạo và cập nhật
  }
);

module.exports = mongoose.model("message", messageSchema);
