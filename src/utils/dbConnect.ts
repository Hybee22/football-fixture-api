import mongoose from "mongoose";
import logger from "./logger";
import dotenv from "dotenv";

dotenv.config();

let isConnected = false;

export const testDBConnection = async () => {
  if (isConnected) {
    return;
  }

  try {
    await mongoose.connect(process.env.TEST_MONGODB_URI ?? "");
    isConnected = true;
    logger.info("Test Database connected successfully");
  } catch (error) {
    // process.exit(1);
  }
};
