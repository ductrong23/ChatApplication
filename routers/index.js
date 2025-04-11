const express = require('express');
const router = express.Router(); // Khai báo router
const accountRouter = require("./account.router");
const viewRouter = require("./view.router");
const uploadRouter = require("./upload.router");
const messageRouter = require("./message.router");
const accountModel = require("../models/account.model"); // Thêm import accountModel

// Định nghĩa route /api/update-language
router.post('/api/update-language', async (req, res) => {
  try {
    const { username, language } = req.body;
    if (!username || !language) {
      return res.status(400).json({ message: "Missing username or language" });
    }
    await accountModel.updateOne({ username }, { language });
    res.sendStatus(200);
  } catch (error) {
    console.error("Error updating language:", error);
    res.status(500).json({ message: "Error updating language" });
  }
});

module.exports = (app) => {
  app.use("/", viewRouter);
  app.use("/api/accounts", accountRouter);
  app.use("/api/uploads", uploadRouter);
  app.use("/api/messages", messageRouter);
  app.use(router); // Thêm router vào app
};