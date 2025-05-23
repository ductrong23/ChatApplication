// SERVER XU LY va TRA LAI CAC SU KIEN TU CLIENT

// ===========================
// Luu tin nhan
const messageModel = require("./models/message.model");
// Avatar trong tin nhan
const accountModel = require("./models/account.model");
// Blacklist
const sensitiveWordModel = require("./models/sensitiveWord.model");
// Dich tin nhan
const translate = require("@iamtraction/google-translate");
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
      room = data.room; // Lấy room từ data
      const username = data.username; // Lấy username từ data
      client.join(room);

      // Lưu mapping giữa username và socket ID
      client.username = username;

      await accountModel.updateOne(
        { username: username }, // Sử dụng username thay vì obj.name
        { $addToSet: { rooms: room } }
      );
      console.log(`${username} joined room ${room}`);
    } catch (error) {
      console.error("Error in join event:", error);
    }
  });

  // XỬ LÝ TIN NHẮN NHẬN ĐƯỢC TỪ CLIENT => TRẢ LẠI VỀ CHO CLIENT
  client.on("message", async function (data) {
    try {
      const obj = JSON.parse(data);

      // Lấy thông tin người gửi
      const senderAccount = await accountModel.findOne({ username: obj.name });
      if (!senderAccount) {
        throw new Error("Sender account not found");
      }

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
        const regex = new RegExp(`\\b${wordObj.word}\\b`, "gi");
        filteredMessage = filteredMessage.replace(
          regex,
          "*".repeat(wordObj.word.length)
        );
      });

      // Dịch tin nhắn
      const roomUsers = await accountModel.find({ rooms: room });
      const senderLang = senderAccount?.language || "en"; // Ngôn ngữ mặc định: tiếng Anh
      let translations = {};
      for (let user of roomUsers) {
        if (
          user.username !== obj.name &&
          user.language &&
          user.language !== senderLang &&
          filteredMessage !==
            (await translate(filteredMessage, { to: user.language })).text
        ) {
          console.log(`Translating "${filteredMessage}" to ${user.language}`);
          try {
            const translated = (
              await translate(filteredMessage, { to: user.language })
            ).text;
            console.log(`Translated to ${user.language}: "${translated}"`);
            translations[user.language] = translated;
          } catch (error) {
            console.error(`Error translating to ${user.language}:`, error);
            translations[user.language] = filteredMessage;
          }
        } else {
          console.log(
            `No translation needed for ${user.username} (lang: ${user.language})`
          );
        }
      }

      // Lưu tin nhắn vào database và lấy _id
      const savedMessage = await messageModel.create({
        room: room,
        sender: obj.name,
        message: filteredMessage,
        avatar: senderAccount
          ? senderAccount.avatar
          : "https://via.placeholder.com/50",
        scheduledTime: scheduledTime,
        timestamp: new Date(),
        translations: translations,
      });

      // Thêm thông tin vào obj để gửi về client
      obj._id = savedMessage._id;
      obj.message = filteredMessage;
      obj.avatar = savedMessage.avatar;
      obj.scheduledTime = savedMessage.scheduledTime;
      obj.timestamp = savedMessage.timestamp; // Gửi timestamp sau khi savedMessage được khởi tạo
      obj.translations = savedMessage.translations;

      console.log("Sending to client:", JSON.stringify(obj));
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

  // === XU LY GOI DIEN VOICE ===
  // Gửi offer (yêu cầu bắt đầu gọi)
  client.on("voice-offer", (data) => {
    const { room, offer, caller, receiver } = JSON.parse(data);
    console.log(
      `Received voice-offer: caller=${caller}, receiver=${receiver}, room=${room}`
    );
    const receiverSocket = Array.from(io.sockets.sockets.values()).find(
      (socket) => socket.username === receiver
    );
    if (receiverSocket) {
      console.log(
        `Sending voice-offer to receiver: receiverSocketId=${receiverSocket.id}`
      );
      receiverSocket.emit(
        "voice-offer",
        JSON.stringify({ offer, caller, receiver })
      );
    } else {
      console.log(`Receiver not found: receiver=${receiver}`);
      client.emit(
        "call-failed",
        JSON.stringify({ message: "Receiver not found or offline" })
      );
    }
  });

  // Gửi answer (phản hồi chấp nhận cuộc gọi)
  client.on("voice-answer", (data) => {
    const { room, answer, receiver, caller } = JSON.parse(data);
    console.log(
      `Received voice-answer: caller=${caller}, receiver=${receiver}`
    );
    const callerSocket = Array.from(io.sockets.sockets.values()).find(
      (socket) => socket.username === caller
    );
    if (callerSocket) {
      console.log(`Sending voice-answer to callerSocketId=${callerSocket.id}`);
      callerSocket.emit("voice-answer", JSON.stringify({ answer, receiver }));
    }
  });

  // Gửi ICE candidate
  client.on("ice-candidate", (data) => {
    const { room, candidate, receiver } = JSON.parse(data);
    console.log(`Received ice-candidate for receiver=${receiver}`);
    const receiverSocket = Array.from(io.sockets.sockets.values()).find(
      (socket) => socket.username === receiver
    );
    if (receiverSocket) {
      console.log(
        `Sending ice-candidate to receiverSocketId=${receiverSocket.id}`
      );
      receiverSocket.emit("ice-candidate", JSON.stringify({ candidate }));
    }
  });

  // Ngắt cuộc gọi
  client.on("end-call", (data) => {
    const { room, receiver } = JSON.parse(data);
    console.log(`Received end-call for receiver=${receiver}`);
    const receiverSocket = Array.from(io.sockets.sockets.values()).find(
      (socket) => socket.username === receiver
    );
    if (receiverSocket) {
      console.log(`Sending end-call to receiverSocketId=${receiverSocket.id}`);
      receiverSocket.emit("end-call", JSON.stringify({}));
    }
  });

  // Xử lý từ chối cuộc gọi
  client.on("reject-call", (data) => {
    const { room, caller } = JSON.parse(data);
    console.log(`Received reject-call for caller=${caller}`);
    const callerSocket = Array.from(io.sockets.sockets.values()).find(
      (socket) => socket.username === caller
    );
    if (callerSocket) {
      console.log(`Sending reject-call to callerSocketId=${callerSocket.id}`);
      callerSocket.emit("reject-call", JSON.stringify({ caller }));
    }
  });
});

connectDB();

router(app);

// SERVER HOẠT ĐỘNG TRÊN PORT 5000
// server.listen(5000, () => {
//   console.log("Server is running on port 5000");
// });

const PORT = process.env.PORT || 5000;
server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on port ${PORT}`);
});
