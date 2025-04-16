// CAC SU KIEN TU CLIENT

const ip_room = document.getElementById("room");
const ip_message = document.getElementById("ip_message");
const btn_join = document.getElementById("btn_join");
const btn_send = document.getElementById("btn_send");
const ul_message = document.getElementById("ul_message");
const btn_logout = document.getElementById("btn_logout");


var socket = io.connect();

// LẤY USERNAME
let my_name = localStorage.getItem("username");

// KIỂM TRA CÓ ĐĂNG NHẬP CHƯA => LOGIN => CHAT
if (!my_name) {
  window.location.href = "/login";
}

// ID CHO TỪNG EMOTION
const emotions = [
  {
    id: 1,
    emotion: '<i class="fa-solid fa-heart" style="color: red"></i>',
  },
  {
    id: 2,
    emotion:
      '<i class="fa-solid fa-face-laugh-beam" style="color: yellow"></i>',
  },
  {
    id: 3,
    emotion: '<i class="fa-solid fa-face-sad-tear" style="color: blue"></i>',
  },
  {
    id: 4,
    emotion:
      '<i class="fa-solid fa-face-rolling-eyes" style="color: orange"></i>',
  },
];

//on: nhan  emit: gui di
socket.on("connect", function () {
  console.log("Connected to server!");
});

// LẤY ID PHÒNG NGƯỜI DÙNG NHẬP GỬI LÊN SERVER
btn_join.addEventListener("click", async () => {
  const room = ip_room.value;
  // socket.emit("join", { room });
  socket.emit("join", { room, username: localStorage.getItem("username") });
  alert(`Join room ${room} success`);

  try {
    const response = await fetch(`/api/messages/${room}`);
    const messages = await response.json();

    my_name = localStorage.getItem("username"); // Cập nhật lại my_name trước khi hiển thị tin nhắn
    console.log("Current user:", my_name); // Log để kiểm tra

    ul_message.innerHTML = "";

    messages.forEach((msg) => {
      const li = document.createElement("li");
      // const time = new Date(msg.timestamp).toLocaleTimeString();
      // Chỉ lấy giờ và phút từ timestamp
      const date = new Date(msg.timestamp);
      const time = `${date.getHours().toString().padStart(2, "0")}:${date
        .getMinutes()
        .toString()
        .padStart(2, "0")}`;

      let emotionHTML = "";
      if (msg.emotion) {
        const emotionData = emotions.find((e) => e.id === msg.emotion);
        if (emotionData) {
          emotionHTML = `<i>${emotionData.emotion}</i>`;
        }
      }

      li.innerHTML = `
      
      <div class="message-container">
        ${
          msg.sender !== my_name
            ? `<img src="${
                msg.avatar || "https://via.placeholder.com/50"
              }" alt="Avatar" class="avatar">`
            : ""
        }
        
        <span id="${msg._id}" class="content">

        <p style="display: inline-block; vertical-align: middle;">${
          msg.message.startsWith("https")
            ? `<img style="width: 200px; background-color: none" src="${msg.message}">`
            : msg.message
        }</p>

        <small class="timestamp">${time}</small>
          ${emotionHTML}
            
        </span>
      
        <i onclick="show(event, '${
          msg._id
        }')" class="choose_emotion fa-solid fa-face-smile" style="color: gray; border-radius: 50%; background: rgba(255, 255, 255, 0.2);"></i>
      
        <i onclick="reportSensitiveWord(event, '${
          msg._id
        }')" class="report_sensitive fa-solid fa-circle-exclamation" style=""></i>
      

        </div>
        `;

      if (msg.sender === my_name) {
        li.classList.add("right");
      }

      ul_message.appendChild(li);
    });

    ul_message.scrollTop = ul_message.scrollHeight;
  } catch (error) {
    console.log("Error fetching messages:", error);
  }
});

// GỬI TIN NHẮN ĐẾN SERVER
const sendMessage = async () => {
  const message = ip_message.value;
  const room = ip_room.value;
  const timeSent = new Date().toLocaleTimeString();

  if (!room) {
    alert("Please join a room or select a friend to chat with!");
    return;
  }

  my_name = localStorage.getItem("username"); // Cập nhật lại my_name trước khi gửi

  if (ip_image?.files[0]) {
    const formData = new FormData();
    formData.append("img", ip_image.files[0]);

    try {
      const res = await fetch("/api/uploads", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(
          `Upload failed with status: ${res.status}, response: ${errorText}`
        );
      }

      const json = await res.json();
      if (!json.url) {
        throw new Error("No URL returned from /api/uploads");
      }

      console.log("Upload successful, URL:", json.url);

      const messageObj = {
        name: my_name,
        message: json.url,
        time: timeSent,
        room: room,
      };

      socket.emit("message", JSON.stringify(messageObj));
      img_message.style.display = "none";
    } catch (error) {
      console.error("Error uploading image:", error.message, error.stack);
    }
  } else {
    const messageObj = {
      name: my_name,
      message: message,
      time: timeSent,
      room: room,
    };

    socket.emit("message", JSON.stringify(messageObj));
    ip_message.value = "";
    ip_message.focus();
  }
};

// GỬI TIN NHẮN BẰNG NÚT SEND
btn_send.addEventListener("click", sendMessage);

// GỬI TIN NHẮN BẰNG PHÍM ENTER
ip_message.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    sendMessage();
  }
});

// NHẬN TIN NHẮN TỪ SERVER TRẢ VỀ
socket.on("thread", function (data) {
  const obj = JSON.parse(data);
  console.log("Received data:", obj);
  console.log("Translations:", obj.translations);
  my_name = localStorage.getItem("username"); // Cập nhật lại my_name khi nhận tin nhắn mới
  const my_language = localStorage.getItem("language") || "en"; // Lấy từ localStorage
  console.log("My language:", my_language); // Log ngôn ngữ của client
  const translatedMessage =
    obj.translations && obj.translations[my_language]
      ? obj.translations[my_language]
      : obj.message;
  console.log("Translated message:", translatedMessage);


  const li = document.createElement("li");

  const time = new Date(obj.timestamp).toLocaleTimeString(); // Dùng timestamp từ server

  li.innerHTML = `
  <div class="message-container">
    ${
      obj.name !== my_name
        ? `<img src="${
            obj.avatar || "https://via.placeholder.com/50"
          }" alt="Avatar" class="avatar">`
        : ""
    }

    <span id="${obj._id}" class="content"> <!-- Sử dụng _id từ database -->

    <p style="display: inline-block; vertical-align: middle;" class="message-text">
          ${
            obj.message.startsWith("https")
              ? '<img style="width: 200px; background-color: none" src="' +
                obj.message +
                '">'
              : obj.message // Hiển thị tin nhắn gốc mặc định
          }
    </p>
        
    ${
      obj.translations && obj.translations[my_language]
        ? `<i class="translate-icon fa-solid fa-language" style="" onclick="showTranslation('${obj._id}', '${translatedMessage}', '${obj.message}')"></i>`
        : ""
    }

    ${
      obj.scheduledTime
        ? `<small class="scheduled-time"> (Scheduled: ${obj.scheduledTime})</small>`
        : ""
    }

    <small class="timestamp">${time}</small>

    </span>
   
    <i onclick="show(event, '${
      obj._id
    }')" class="choose_emotion fa-solid fa-face-smile" style="color: gray; border-radius: 50%; background: rgba(255, 255, 255, 0.2);"></i>

    <i onclick="reportSensitiveWord(event, '${
      obj._id
    }')" class="report_sensitive fa-solid fa-circle-exclamation"></i>

    </div>
    `;

  console.log("Received:", obj);
  console.log("My language:", my_language);
  console.log("Translated message:", translatedMessage);
  // Nếu tin của mình thì ở bên phải
  if (obj.name === my_name) {
    li.classList.add("right");
  }

  ul_message.appendChild(li);
  ul_message.scrollTop = ul_message.scrollHeight;

  // Kiểm tra và lên lịch thông báo
  if (obj.scheduledTime) {
    console.log(
      "Message has scheduledTime, calling scheduleNotification:",
      obj.scheduledTime
    );
    scheduleNotification(obj);
  } else {
    console.log("No scheduledTime detected in message");
  }
});

// // Lưu ngôn ngữ khi tải trang
// document.addEventListener("DOMContentLoaded", () => {
//   localStorage.setItem("language", "<%= currentUser.language || 'en' %>");
// });

// HÀM ẨN HIỆN EMOTIONS KHI TRỎ VÀO
function show(e, id) {
  if (e.target.classList.contains("choose_emotion")) {
    if (e.target.innerHTML.toString().trim().length === 0) {
      e.target.innerHTML = `
        <div class="emotions">
          <i onclick="choose(event, '${id}', 1)" class="fa-solid fa-heart" style="color: red; border: 3px sloid white"></i>
          <i onclick="choose(event, '${id}', 2)" class="fa-solid fa-face-laugh-beam" style="color: yellow; border: 3px sloid white "></i>
          <i onclick="choose(event, '${id}', 3)" class="fa-solid fa-face-sad-tear" style="color: green; border: 3px sloid white"></i>
          <i onclick="choose(event, '${id}', 4)" class="fa-solid fa-face-rolling-eyes" style="color: orange; border: 3px sloid white"></i>
        </div>
      `;
    } else {
      e.target.innerHTML = ``;
    }
  }
}

// HÀM HIỆN EMOTION ĐÃ CHỌN LÊN TIN NHẮN
function choose(e, id, id_emotion) {
  const span_message = document.getElementById(id);
  const emotion = e.target;

  emotion.style.background = "gray";
  emotion.style.borderRadius = "50%";

  span_message.appendChild(emotion);

  // GỬI EMOTION LÊN SERVER
  const obj = {
    id: id, // Đây là _id từ database
    emotion: id_emotion,
  };
  socket.emit("emotion", JSON.stringify(obj));
}

// NHẬN EMOTION TỪ SERVER TRẢ VỀ
socket.on("emotion", (data) => {
  const obj = JSON.parse(data);
  const span_message = document.getElementById(obj.id + "");

  let emotion = emotions[obj.emotion - 1].emotion;
  const div = document.createElement("div");
  div.innerHTML = emotion;
  emotion = div.firstChild;

  emotion.style.background = "gray";
  emotion.style.borderRadius = "50%";

  span_message.appendChild(emotion);
});

// GỬI HÌNH ẢNH
const ip_image = document.getElementById("ip_image");
const img_message = document.getElementById("img_message");

ip_image.addEventListener("change", () => {
  img_message.src = URL.createObjectURL(ip_image.files[0]);
  img_message.style.display = "block";
});

// LOG OUT
btn_logout.addEventListener("click", () => {
  localStorage.removeItem("username");
  localStorage.removeItem("full_name"); // Xóa full_name khi đăng xuất
  localStorage.removeItem("avatar"); // Xóa avatar khi đăng xuất
  window.location.href = "/login";
});

// SỰ KIỆN GỬI LỜI MỜI KẾT BẠN
window.sendFriendRequest = function (friendUsername) {
  const username = localStorage.getItem("username");
  console.log("Sending friend request:", { username, friendUsername });
  fetch("/api/accounts/send-friend-request", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, friendUsername }),
  })
    .then((res) => {
      console.log("Response status:", res.status);
      return res.json();
    })
    .then((data) => {
      console.log("Response data:", data);
      alert(data.message);
      if (data.message === "Friend request sent") location.reload();
    })
    .catch((err) => {
      console.error("Error sending friend request:", err);
      alert("Error sending friend request: " + err.message);
    });
};

// SỰ KIỆN ĐỒNG Ý KẾT BẠN
window.acceptFriendRequest = function (friendUsername) {
  const username = localStorage.getItem("username");
  console.log("Accepting friend request:", { username, friendUsername });
  fetch("/api/accounts/accept-friend-request", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, friendUsername }),
  })
    .then((res) => {
      console.log("Response status:", res.status);
      return res.json();
    })
    .then((data) => {
      console.log("Response data:", data);
      alert(data.message);
      if (data.message === "Friend request accepted") location.reload();
    })
    .catch((err) => {
      console.error("Error accepting friend request:", err);
      alert("Error accepting friend request: " + err.message);
    });
};

// SỰ KIỆN CHAT KHI LÀ BẠN BÈ
window.startChat = function (friendUsername) {
  const myUsername = localStorage.getItem("username");
  console.log("Starting chat with:", { myUsername, friendUsername });
  const room = [myUsername, friendUsername].sort().join("_");
  document.getElementById("room").value = room;
  document.getElementById("btn_join").click();
};

// SU KIEN BAO CAO TU NGU NHAY CAM
window.reportSensitiveWord = function (e, messageId) {
  const messageSpan = document.getElementById(messageId);
  if (!messageSpan) {
    alert("Error: Message not found on page");
    return;
  }

  const messageContent = messageSpan.querySelector("p").textContent.trim();
  const sensitiveWord = prompt(
    "Enter the sensitive word to report:",
    messageContent
  );
  if (!sensitiveWord) return;

  const reporter = localStorage.getItem("username");
  if (!reporter) {
    alert("Error: You must be logged in to report");
    return;
  }

  const reportData = {
    messageId,
    sensitiveWord,
    reporter,
  };

  console.log("Sending report data:", reportData); // Log dữ liệu trước khi gửi

  fetch("/api/messages/report-sensitive", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(reportData),
  })
    .then((res) => {
      if (!res.ok) {
        throw new Error(`Server responded with status: ${res.status}`);
      }
      return res.json();
    })
    .then((data) => {
      alert(data.message);
    })
    .catch((err) => {
      console.error("Error reporting sensitive word:", err);
      alert("Error reporting sensitive word: " + err.message);
    });
};

// HAM LEN LICH THONG BAO
function scheduleNotification(message) {
  const [hours, minutes] = message.scheduledTime.split(":").map(Number);
  const now = new Date();
  const scheduledDate = new Date(now);
  scheduledDate.setHours(hours, minutes, 0, 0);

  if (scheduledDate < now) {
    scheduledDate.setDate(scheduledDate.getDate() + 1);
  }

  const timeToNotify = scheduledDate - now;

  console.log(
    `Scheduling notification for ${
      message.scheduledTime
    } in ${timeToNotify}ms (at ${scheduledDate.toLocaleString()})`
  );

  setTimeout(() => {
    console.log("Notification triggered for:", message.message);
    if (Notification.permission === "granted") {
      new Notification(`Reminder from ${message.name}`, {
        body: message.message,
        icon: message.avatar || "https://via.placeholder.com/50",
      });
    } else if (Notification.permission !== "denied") {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          new Notification(`Reminder from ${message.name}`, {
            body: message.message,
            icon: message.avatar || "https://via.placeholder.com/50",
          });
        } else {
          alert(`Reminder from ${message.name}: ${message.message}`);
        }
      });
    } else {
      alert(`Reminder from ${message.name}: ${message.message}`);
    }
  }, timeToNotify);
}

// Yêu cầu quyền thông báo khi tải trang
document.addEventListener("DOMContentLoaded", () => {
  if (
    Notification.permission !== "granted" &&
    Notification.permission !== "denied"
  ) {
    Notification.requestPermission().then((permission) => {
      console.log("Notification permission:", permission);
    });
  }
});

// Hàm hiển thị bản dịch khi nhấp vào icon
function showTranslation(messageId, translatedText, originalText) {
  const messageElement = document.getElementById(messageId);
  const textElement = messageElement.querySelector(".message-text");
  const translationElement = messageElement.querySelector(".translation-text");

  if (!translationElement) {
    // Nếu chưa có phần hiển thị bản dịch, thêm vào
    const translationSpan = document.createElement("span");
    translationSpan.className = "translation-text";
    translationSpan.innerHTML =
      translatedText +
      ` <small class="original-message">(Original: ${originalText})</small>`;
    textElement.style.display = "none"; // Ẩn tin nhắn gốc
    messageElement.insertBefore(translationSpan, textElement.nextSibling);
  } else {
    // Nếu đã có, xóa bản dịch và hiện lại tin gốc
    translationElement.remove();
    textElement.style.display = "inline-block";
  }
}

