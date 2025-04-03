const express = require("express");
const router = express.Router();
const { renderChat } = require("../controllers/view.controller");

router.route("/login").get((req, res) => {
  res.render("login.ejs");
});

router
.route("/chat")
// .get((req, res) => {
//   return res.render("chat.ejs");
// });
.get(renderChat)

module.exports = router;
