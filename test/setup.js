// const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

process.env.NODE_ENV = 'test';

module.exports = async () => {
//   await mongoose.connect(process.env.TEST_MONGODB_URI || "");
};
