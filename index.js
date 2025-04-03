// SERVER XU LY va TRA LAI CAC SU KIEN TU CLIENT

// ===========================
//Luu tin nhan
const messageModel = require("./models/message.model");
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

  //Xu ly tin nhan nhan duoc tu Client => Gui lai phong chat

  client.on("message", async function (data) {
    try {
      const obj = JSON.parse(data);
      const now = new Date();
      obj.time =
        now.getHours().toString().padStart(2, "0") +
        ":" +
        now.getMinutes().toString().padStart(2, "0");

      // Lưu tin nhắn vào database và lấy _id
      const savedMessage = await messageModel.create({
        room: room,
        sender: obj.name,
        message: obj.message,
      });

      // Thêm _id vào obj để gửi về client
      obj._id = savedMessage._id;

      io.to(room).emit("thread", JSON.stringify(obj));
    } catch (error) {
      console.error("Error handling message:", error);
    }
  });

  // Xu ly emotion nhan duoc tu Client => Gui lai phong chat
  // Luu ca emotion vao database

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

// app.get("/chat", (req, res) => {
//   return res.render("chat.ejs");
// });

server.listen(5000, () => {
  console.log("Server is running on port 5000");
});
