// CAC SU KIEN TU CLIENT

// const ip_name = document.getElementById("name");
const ip_room = document.getElementById("room");
const ip_message = document.getElementById("ip_message");

const btn_join = document.getElementById("btn_join");
const btn_send = document.getElementById("btn_send");

const ul_message = document.getElementById("ul_message");

var socket = io.connect();

// let my_name = "";
let my_name = localStorage.getItem("username");

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

//Lay id phong ra der gui den server
btn_join.addEventListener("click", () => {
  // my_name = ip_name.value;
  const room = ip_room.value;
  socket.emit("join", room);
  alert(`Join room ${room} success`);
});

//Ham gui tin nhan den server
const sendMessage = () => {
  const message = ip_message.value;
  // if (!message) {
  //   return;
  // }

  //Lay ID cho tin nhan de tha emotion chinh xac tin nhan
  let id = "";
  for (let i = 0; i < 8; i++) {
    id += Math.floor(Math.random() * 10);
  }

  if (ip_image?.files[0]) {
    const formData = new FormData();
    formData.append("img", ip_image.files[0]);
    fetch("/api/uploads", {
      method: "POST",
      body: formData,
      // headers: {
      //   'Accept': 'application/json, application/xml, text/plain, text/html, *.*',
      //   "Content-Type": "multipart/form-data",
      // },
    })
      .then((res) => res.json())
      .then((json) => {
        const obj = {
          id: +id, // +: chuyen ID tu chuoi thanh so
          name: my_name,
          message: json.url,
        };

        //Gui tin nhan len Server
        socket.emit("message", JSON.stringify(obj));
        img_message.style.display = "none";
      })
      .catch((error) => {
        console.log("Error API");
      });
  } else {
    const obj = {
      id: +id, // +: chuyen ID tu chuoi thanh so
      name: my_name,
      message: message,
    };

    //Gui tin nhan len Server
    socket.emit("message", JSON.stringify(obj));
    ip_message.value = "";
    ip_message.focus();
  }
};

//Gui tin nhan bang nut Send
btn_send.addEventListener("click", sendMessage);

//Gui tin nhan bang nut Enter
ip_message.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    sendMessage();
  }
});

//Nhan tin nhan tu server
socket.on("thread", function (data) {
  const obj = JSON.parse(data);
  const li = document.createElement("li");
  li.innerHTML = `
  <span id="${obj.id}">
  <p>${
    obj.message.startsWith("https")
      ? '<img style="width: 200px; background-color: none" src="' + obj.message + '">'
      : obj.message
  }</p>
  <i></i>
  </span>
   <i onclick="show(event, ${
     obj.id
   })" class="choose_emotion fa-solid fa-face-smile" style="color: white"></i>
  `;
  if (obj.name === my_name) {
    li.classList.add("right");
  }
  ul_message.appendChild(li);
  ul_message.scrollTop = ul_message.scrollHeight;
  // loadChooseEmotion();
});

// Ham hien/an emotion khi click vao bieu tuong
function show(e, id) {
  if (e.target.classList.contains("choose_emotion")) {
    if (e.target.innerHTML.toString().trim().length === 0) {
      e.target.innerHTML = `
    <div class="emotions">
             <i onclick="choose(event, ${id}, 1)" class="fa-solid fa-heart" style="color: red"></i>
             <i onclick="choose(event, ${id}, 2)" class="fa-solid fa-face-laugh-beam" style="color: yellow"></i>
             <i onclick="choose(event, ${id}, 3)" class="fa-solid fa-face-sad-tear" style="color: blue"></i>
             <i onclick="choose(event, ${id}, 4)" class="fa-solid fa-face-rolling-eyes" style="color: orange"></i>
           </div>
   `;
    } else {
      e.target.innerHTML = ``;
    }
  }
}

//Ham hien emotion len tin nhan
function choose(e, id, id_emotion) {
  const span_message = document.getElementById(id + "");

  const emotion = e.target;
  emotion.style.position = "absolute";
  emotion.style.top = "23px";
  emotion.style.left = "5px";
  emotion.style.background = "gray";
  emotion.style.borderRadius = "50%";

  span_message.appendChild(emotion);

  //Gui emotion di len server => ben kia nhan duoc
  const obj = {
    id: id,
    emotion: id_emotion,
  };
  socket.emit("emotion", JSON.stringify(obj));
}

//Client nhan duoc emotion tu Server
socket.on("emotion", (data) => {
  // console.log(data);
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

// function loadChooseEmotion() {
//   const choose_emotion = document.getElementsByClassName("choose_emotion");
//   for (let ce of choose_emotion) {
//     ce.addEventListener("click", (e) => {

//     });
//   }
// }

//Gui hinh anh
const ip_image = document.getElementById("ip_image");
const img_message = document.getElementById("img_message");

ip_image.addEventListener("change", () => {
  img_message.src = URL.createObjectURL(ip_image.files[0]);
  img_message.style.display = "block";
});
