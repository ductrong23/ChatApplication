// // const accountModel = require("../models/account.model");

// // module.exports = {
// //   renderChat: async (req, res) => {
// //     const username = localStorage.getItem("username"); // Lay tu Client qua localStorage
// //     const accounts = await accountModel.find(); //Tim tat ca tai khoan trong database
// //     const currentUser = await accountModel
// //       .findOne({ username })
// //       .populate("friends"); //Lay thong tin chi tiet user va ban be
// //     return res.render("chat.ejs", {
// //       accounts: accounts,
// //       currentUser: currentUser || { friends: [] },
// //     });
// //   },
// // };

// const accountModel = require("../models/account.model");

// module.exports = {
//   renderChat: async (req, res) => {
//     const username = req.query.username; // Lấy username từ query string
//     const accounts = await accountModel.find(); // Tất cả tài khoản
//     const currentUser = await accountModel.findOne({ username }).populate("friends"); // Lấy thông tin user và bạn bè
//     if (!username || !currentUser) {
//       return res.redirect("/login"); // Nếu không có username hoặc user, chuyển hướng về login
//     }
//     return res.render("chat.ejs", {
//       accounts: accounts,
//       currentUser: currentUser || { friends: [] }
//     });
//   },
// };

const accountModel = require("../models/account.model");

module.exports = {
  renderChat: async (req, res) => {
    const username = req.query.username;
    const accounts = await accountModel.find();
    const currentUser = await accountModel
      .findOne({ username })
      .populate("friends")
      .populate("friendRequests");

    if (!username || !currentUser) {
      return res.redirect("/login");
    }
    console.log("Current user language:", currentUser.language); // Thêm log để kiểm tra
    return res.render("chat.ejs", {
      accounts: accounts,
      currentUser: currentUser || { friends: [], friendRequests: [] },
    });
  },
};
