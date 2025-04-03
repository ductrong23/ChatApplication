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
    room = data.room;
    client.join(room);
  });

  //Xu ly tin nhan nhan duoc tu Client => Gui lai phong chat

  // client.on("message", function (data) {
  //   io.to(room).emit("thread", data);
  // });
  // (BỎ QUA)

  // client.on("message", async function (data) {
  //   const obj = JSON.parse(data); // Chuyển từ JSON string thành object
  //   // obj.time = new Date().toLocaleTimeString("vi-VN"); // Lấy thời gian hiện tại theo múi giờ Việt Nam
  //   const now = new Date();
  //   obj.time =
  //     now.getHours().toString().padStart(2, "0") +
  //     ":" +
  //     now.getMinutes().toString().padStart(2, "0");
  //   io.to(room).emit("thread", JSON.stringify(obj)); // Gửi tin nhắn kèm thời gian

  // });

  // ======
  //Xu ly tin nhan nhan duoc tu Client => Gui lai phong chat
  client.on("message", async function (data) {
    try {
      const obj = JSON.parse(data);
      const now = new Date();
      obj.time =
        now.getHours().toString().padStart(2, "0") +
        ":" +
        now.getMinutes().toString().padStart(2, "0");

      // Gửi tin nhắn qua WebSocket
      io.to(room).emit("thread", JSON.stringify(obj));

      // Lưu tin nhắn vào database (đề phòng client không gọi API)
      await messageModel.create({
        room: room,
        sender: obj.name,
        message: obj.message,
        // emotion: id_emotion,
      });
    } catch (error) {
      console.error("Error handling message:", error);
    }
  });
  // ======

  //Xu ly emotion nhan duoc tu Client => Gui lai phong chat
  client.on("emotion", async function (data) {
    io.to(room).emit("emotion", data);
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
