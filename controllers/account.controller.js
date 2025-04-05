const accountModel = require("../models/account.model");
const cloudinary = require("../configs/cloudinary"); // Import cloudinary

module.exports = {
  // register: async (req, res) => {
  //   const body = req.body;
  //   const newAccount = await accountModel.create(body);
  //   return res.status(201).json(newAccount);
  // },
  register: async (req, res) => {
    try {
      const { username, password, full_name } = req.body;
      console.log("Register data:", { username, password, full_name, file: req.file }); // Log để kiểm tra dữ liệu nhận được
  
      if (!username || !password || !full_name) {
        return res.status(400).json({ message: "Missing required fields" });
      }
  
      let avatarUrl = "https://via.placeholder.com/50";
      if (req.file) {
        const result = await cloudinary.uploader.upload(req.file.path);
        avatarUrl = result.secure_url;
        console.log("Avatar uploaded:", avatarUrl);
      }
  
      const newAccount = await accountModel.create({
        username,
        password,
        full_name,
        avatar: avatarUrl,
      });
      console.log("New account created:", newAccount); // Log để kiểm tra tài khoản đã lưu
  
      return res.status(201).json(newAccount);
    } catch (error) {
      console.error("Error in register:", error.message); // Log lỗi chi tiết
      return res.status(500).json({ message: "Error registering account", error: error.message });
    }
  },

  // login: async (req, res) => {
  //   const body = req.body; //username, password
  //   console.log(body)
  //   const account = await accountModel.findOne({
  //     username: body.username,
  //     password: body.password,
  //   });
  //   if (!account) {
  //     return res.status(404).json({
  //       statusCode: 404,
  //       message: "Account not found",
  //     });
  //   }
  //   // return res.status(200).json(account)
  //   return res.status(200).json({
  //     username: account.username,
  //     full_name: account.full_name, // Trả về full_name
  //   });
  // },

  login: async (req, res) => {
    const body = req.body;
    const account = await accountModel.findOne({
      username: body.username,
      password: body.password,
    });
    if (!account) {
      return res.status(404).json({
        statusCode: 404,
        message: "Account not found",
      });
    }
    return res.status(200).json({
      username: account.username,
      full_name: account.full_name,
      avatar: account.avatar, // Trả về avatar
    });
  },
  // // Xu ly yeu cau ket ban
  // addFriend: async (req, res) => {
  //   const { username, friendUsername } = req.body; // username: người gửi, friendUsername: người được kết bạn
  //   try {
  //     const user = await accountModel.findOne({ username });
  //     const friend = await accountModel.findOne({ username: friendUsername });

  //     if (!user || !friend) {
  //       return res.status(404).json({ message: "User or friend not found" });
  //     }

  //     if (user.friends.includes(friend._id)) {
  //       return res.status(400).json({ message: "Already friends" });
  //     }

  //     // Thêm friend vào danh sách bạn bè của user
  //     user.friends.push(friend._id);
  //     await user.save();

  //     // Thêm user vào danh sách bạn bè của friend (kết bạn 2 chiều)
  //     friend.friends.push(user._id);
  //     await friend.save();

  //     return res.status(200).json({ message: "Friend added successfully" });
  //   } catch (error) {
  //     return res.status(500).json({ message: "Error adding friend", error });
  //   }
  // },
 
  sendFriendRequest: async (req, res) => {
    const { username, friendUsername } = req.body;
    try {
      const user = await accountModel.findOne({ username });
      const friend = await accountModel.findOne({ username: friendUsername });

      if (!user || !friend) {
        return res.status(404).json({ message: "User or friend not found" });
      }

      if (user.friends.includes(friend._id)) {
        return res.status(400).json({ message: "Already friends" });
      }

      if (friend.friendRequests.includes(user._id)) {
        return res.status(400).json({ message: "Friend request already sent" });
      }

      friend.friendRequests.push(user._id);
      await friend.save();

      return res.status(200).json({ message: "Friend request sent" });
    } catch (error) {
      return res.status(500).json({ message: "Error sending friend request", error });
    }
  },
  acceptFriendRequest: async (req, res) => {
    const { username, friendUsername } = req.body;
    try {
      const user = await accountModel.findOne({ username });
      const friend = await accountModel.findOne({ username: friendUsername });

      if (!user || !friend) {
        return res.status(404).json({ message: "User or friend not found" });
      }

      if (!user.friendRequests.includes(friend._id)) {
        return res.status(400).json({ message: "No friend request from this user" });
      }

      // Xóa lời mời khỏi friendRequests
      user.friendRequests = user.friendRequests.filter(id => id.toString() !== friend._id.toString());
      // Thêm vào danh sách bạn bè của cả hai
      user.friends.push(friend._id);
      friend.friends.push(user._id);

      await user.save();
      await friend.save();

      return res.status(200).json({ message: "Friend request accepted" });
    } catch (error) {
      return res.status(500).json({ message: "Error accepting friend request", error });
    }
  },
};
