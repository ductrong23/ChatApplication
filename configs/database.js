// const mongoose = require("mongoose");

// const connectDB = async () => {
//   try {
//     //Ham doi ket noi den Database
//     await mongoose.connect("mongodb://127.0.0.1:27017/demo_app_chat");
//     console.log("Connect Database Success");
//   } catch (error) {
//     console.log(error.message);
//   }
// };

// module.exports = connectDB;


const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || "mongodb://localhost:27017/demo_app_chat";
    console.log("Connecting to MongoDB at:", mongoURI); // Thêm log để debug
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connect Database Success");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

module.exports = connectDB;