const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");

// const { register, login, addFriend} = require("../controllers/account.controller");
const { register, login, sendFriendRequest, acceptFriendRequest} = require("../controllers/account.controller");
const upload = multer({ dest: path.join(__dirname, "../uploads") });

router.route("/login").post(login);

// router.route("/register").post(register);
router.route("/register").post(upload.single("avatar"), register); // Thêm middleware upload

// router.route("/add-friend").post(addFriend); // Route mới để kết bạn
router.route("/send-friend-request").post(sendFriendRequest);
router.route("/accept-friend-request").post(acceptFriendRequest);

module.exports = router;
