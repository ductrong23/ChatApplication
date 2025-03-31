const accountRouter = require("./account.router");
const viewRouter = require("./view.router");
const uploadRouter = require("./upload.router");


module.exports = (app) => {
  app.use("/", viewRouter);
  app.use("/api/accounts", accountRouter);
  app.use("/api/uploads", uploadRouter);
};
