const mongoose = require("mongoose");

const sensitiveWordSchema = mongoose.Schema(
  {
    word: {
      type: String,
      required: true,
      unique: true, // Đảm bảo từ không trùng lặp
    },
    reportedBy: {
      type: String, // Username của người báo cáo
      required: true,
    },
    messageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "message", // Tham chiếu đến tin nhắn gốc
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "blacklisted"], // Trạng thái: chờ duyệt hoặc đã vào danh sách đen
      default: "pending",
    },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

module.exports = mongoose.model("sensitiveWord", sensitiveWordSchema);