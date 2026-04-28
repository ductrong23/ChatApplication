// const cloudinary = require("cloudinary").v2;

// cloudinary.config({
//   cloud_name: "djqe3fdeq",
//   api_key: "328313576248613",
//   api_secret: "eQ3eps1aagYVc44R0TDbKQkngXM",
//   secure: true,
// });

// module.exports = cloudinary;


const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME, // Phải là biến môi trường
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

module.exports = cloudinary;
