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
    timestamp: {
      // Thời gian gửi tin nhắn
      type: Date,
      default: Date.now,
    },
    // emotion: {
    //   type: String,
    //   required: false,
    // },
  },
  {
    versionKey: false,
    timestamps: true, // Thêm thời gian tạo và cập nhật
  }
);

module.exports = mongoose.model("message", messageSchema);
