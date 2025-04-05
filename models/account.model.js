const mongoose = require("mongoose");

const accountSchema = mongoose.Schema(
  {
    username: {
      type: String,
      require: true, //Bat buoc phai co, khong duoc de trong
      unique: true, //Duy nhat, khong duoc phep trung nhau
    },
    password: {
      type: String,
      require: true, //Bat buoc phai co, khong duoc de trong
    },
    full_name: {
      type: String,
      require: true, //Bat buoc phai co, khong duoc de trong
    },
    // Anh dai dien
    avatar: {
      type: String, // URL của ảnh đại diện
      default: "https://via.placeholder.com/50", // Ảnh mặc định nếu không có
    },
    // friends la mang chua cac ObjectID cua nhung tai khoan khac (ban be)
    friends: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "account", // Tham chiếu đến chính model account
      },
    ],
    friendRequests: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "account", // Lưu danh sách lời mời kết bạn đang chờ
      },
    ],
  },
  {
    versionKey: false,
    timestamps: true, //Thoi gian tao, update truong du lieu
  }
);

module.exports = mongoose.model("account", accountSchema);
