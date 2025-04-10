// SERVER XU LY va TRA LAI CAC SU KIEN TU CLIENT

// ===========================
// Luu tin nhan
const messageModel = require("./models/message.model");
// Avatar trong tin nhan
const accountModel = require("./models/account.model");
// Blacklist
const sensitiveWordModel = require("./models/sensitiveWord.model");
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
      // console.log("Received message:", obj);

      // Nhận diện thời gian trong tin nhắn (định dạng HH:MM)
      const timeRegex = /(\d{1,2}:\d{2})/;
      const timeMatch = obj.message.match(timeRegex);
      let scheduledTime = null;
      if (timeMatch) {
        scheduledTime = timeMatch[0]; // Ví dụ: "15:00"
        console.log("Detected scheduled time:", scheduledTime);
      }

      // Lấy danh sách từ nhạy cảm trong blacklist
      const blacklistedWords = await sensitiveWordModel.find({
        status: "blacklisted",
      });
      let filteredMessage = obj.message;

      // Thay thế từ nhạy cảm bằng dấu *
      blacklistedWords.forEach((wordObj) => {
        const regex = new RegExp(`\\b${wordObj.word}\\b`, "gi"); // Tìm từ độc lập, không phân biệt hoa thường
        filteredMessage = filteredMessage.replace(
          regex,
          "*".repeat(wordObj.word.length)
        );
      });

      // Lấy thông tin người gửi
      const senderAccount = await accountModel.findOne({ username: obj.name });
      // Lưu tin nhắn vào database và lấy _id
      const savedMessage = await messageModel.create({
        room: room,
        sender: obj.name,
        // message: obj.message,
        message: filteredMessage, // Duyet tu ngu nhay cam
        avatar: senderAccount
          ? senderAccount.avatar
          : "https://via.placeholder.com/50", // Lưu avatar vào tin nhắn
        scheduledTime: scheduledTime, // Thêm trường scheduledTime
        timestamp: now, // Lưu thời gian gửi thực tế
      });

      // Thêm _id vào obj để gửi về client
      obj._id = savedMessage._id;
      obj.message = filteredMessage;
      obj.avatar = savedMessage.avatar;
      obj.scheduledTime = scheduledTime; // Gửi scheduledTime về client

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
