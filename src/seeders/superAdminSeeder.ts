import User from "../models/User";
import logger from "../utils/logger";
import mongoose from "mongoose";

async function seedSuperAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI ?? "");

    const superAdminData = {
      name: "Super Admin",
      email: process.env.SUPER_ADMIN_EMAIL,
      password: process.env.SUPER_ADMIN_PASSWORD,
      role: "superadmin",
    };

    const existingSuperAdmin = await User.findOne({ role: "superadmin" });
    if (existingSuperAdmin) {
      logger.info("Super admin already exists");
      return;
    }

    const superAdmin = new User(superAdminData);
    await superAdmin.save();
    logger.info("Super admin created successfully");
  } catch (error) {
    logger.error("Error seeding super admin:", error);
  } finally {
    await mongoose.disconnect();
    logger.info("Disconnected from MongoDB after seeding super admin");
  }
}

export default seedSuperAdmin;
