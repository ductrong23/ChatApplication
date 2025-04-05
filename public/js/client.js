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
  socket.emit("join", { room });
  alert(`Join room ${room} success`);

  try {
    const response = await fetch(`/api/messages/${room}`);
    const messages = await response.json();

    my_name = localStorage.getItem("username"); // Cập nhật lại my_name trước khi hiển thị tin nhắn
    console.log("Current user:", my_name); // Log để kiểm tra

    ul_message.innerHTML = "";

    messages.forEach((msg) => {
      const li = document.createElement("li");
      const time = new Date(msg.timestamp).toLocaleTimeString();

      let emotionHTML = "";
      if (msg.emotion) {
        const emotionData = emotions.find((e) => e.id === msg.emotion);
        if (emotionData) {
          emotionHTML = `<i style="position: absolute; top: 23px; left: 5px; background: gray; border-radius: 50%">${emotionData.emotion}</i>`;
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

          <small style="color: gray; font-size: 12px; margin-top: 5px; display: block; text-align: right;">${time}</small>
          ${emotionHTML}
        </span>
        <i onclick="show(event, '${
          msg._id
        }')" class="choose_emotion fa-solid fa-face-smile" style="color: white"></i>
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
  my_name = localStorage.getItem("username"); // Cập nhật lại my_name khi nhận tin nhắn mới
  console.log("Received message, current user:", my_name); // Log để kiểm tra
  const li = document.createElement("li");

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

      <p style="display: inline-block; vertical-align: middle;">${
        obj.message.startsWith("https")
          ? '<img style="width: 200px; background-color: none" src="' +
            obj.message +
            '">'
          : obj.message
      }</p>
      <small style="color: gray; font-size: 12px; margin-top: 5px; display: block; text-align: right;">${
        obj.time
      }</small>
      <i></i>
    </span>
    <i onclick="show(event, '${
      obj._id
    }')" class="choose_emotion fa-solid fa-face-smile" style="color: white"></i>
 </div>
    `;

    // Nếu tin của mình thì ở bên phải
  if (obj.name === my_name) {
    li.classList.add("right");
  }

  ul_message.appendChild(li);
  ul_message.scrollTop = ul_message.scrollHeight;
});

// HÀM ẨN HIỆN EMOTIONS KHI TRỎ VÀO
function show(e, id) {
  if (e.target.classList.contains("choose_emotion")) {
    if (e.target.innerHTML.toString().trim().length === 0) {
      e.target.innerHTML = `
        <div class="emotions">
          <i onclick="choose(event, '${id}', 1)" class="fa-solid fa-heart" style="color: red"></i>
          <i onclick="choose(event, '${id}', 2)" class="fa-solid fa-face-laugh-beam" style="color: yellow"></i>
          <i onclick="choose(event, '${id}', 3)" class="fa-solid fa-face-sad-tear" style="color: blue"></i>
          <i onclick="choose(event, '${id}', 4)" class="fa-solid fa-face-rolling-eyes" style="color: orange"></i>
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

  emotion.style.position = "absolute";
  emotion.style.top = "23px";
  emotion.style.left = "5px";
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

  emotion.style.position = "absolute";
  emotion.style.top = "23px";
  emotion.style.left = "5px";
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
