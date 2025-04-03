const accountRouter = require("./account.router");
const viewRouter = require("./view.router");
const uploadRouter = require("./upload.router");
const messageRouter = require("./message.router");

module.exports = (app) => {
  app.use("/", viewRouter);
  app.use("/api/accounts", accountRouter);
  app.use("/api/uploads", uploadRouter);
  app.use("/api/messages", messageRouter); // Thêm router cho tin nhắn
};
