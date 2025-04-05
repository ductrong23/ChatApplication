// SERVER XU LY va TRA LAI CAC SU KIEN TU CLIENT

// ===========================
// Luu tin nhan
const messageModel = require("./models/message.model");
// Avatar trong tin nhan
const accountModel = require("./models/account.model"); // Thêm import accountModel
// ===========================

const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const connectDB = require("./configs/database");
const router = require("./routers");

app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Thêm để parse form data
app.use(express.static("public"));

app.set("view engine", "ejs");
app.set("views", "views");

io.on("connection", function (client) {
  console.log("Have connected device");
  var room; //CHAT ROOM

  // Tham gia chat
  client.on("join", async function (data) {
    try {
      room = data.room;
      client.join(room);
    } catch (error) {
      console.error("Error in join event:", error);
    }
  });

  // XỬ LÝ TIN NHẮN NHẬN ĐƯỢC TỪ CLIENT => TRẢ LẠI VỀ CHO CLIENT
  client.on("message", async function (data) {
    try {
      const obj = JSON.parse(data);
      const now = new Date();
      obj.time =
        now.getHours().toString().padStart(2, "0") +
        ":" +
        now.getMinutes().toString().padStart(2, "0");

      // Lấy thông tin người gửi
      const senderAccount = await accountModel.findOne({ username: obj.name });
      // Lưu tin nhắn vào database và lấy _id
      const savedMessage = await messageModel.create({
        room: room,
        sender: obj.name,
        message: obj.message,
        avatar: senderAccount
          ? senderAccount.avatar
          : "https://via.placeholder.com/50", // Lưu avatar vào tin nhắn
      });

      // Thêm _id vào obj để gửi về client
      obj._id = savedMessage._id;
      obj.avatar = savedMessage.avatar;

      io.to(room).emit("thread", JSON.stringify(obj));
    } catch (error) {
      console.error("Error handling message:", error);
    }
  });

  // XỬ LÝ EMOTION NHẬN TỪ CLIENT => TRẢ LẠI PHÒNG CHAT
  // LƯU EMOTION VÀO DATABASE
  client.on("emotion", async function (data) {
    try {
      const obj = JSON.parse(data);
      const { id, emotion } = obj;

      // Cập nhật tin nhắn trong database dựa trên id
      await messageModel.updateOne(
        { _id: id }, // Giả sử id trong client tương ứng với _id trong MongoDB
        { $set: { emotion: emotion } }
      );

      // Gửi emotion tới tất cả client trong phòng
      io.to(room).emit("emotion", data);
    } catch (error) {
      console.error("Error handling emotion:", error);
    }
  });
});

connectDB();

router(app);

// SERVER HOẠT ĐỘNG TRÊN PORT 5000
server.listen(5000, () => {
  console.log("Server is running on port 5000");
});
