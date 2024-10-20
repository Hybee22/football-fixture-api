import User from "../models/User";
import jwt from "jsonwebtoken";
import logger from "../utils/logger";
import { AppError } from "../utils/customError";

export class AuthService {
  async registerUser(userData: any) {
    const { email } = userData;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new AppError("User already exists", 400);
    }
    const newUser = new User(userData);
    return await newUser.save();
  }

  async loginUser(email: string, password: string) {
    const user = await User.findOne({ email });

    if (!user) {
      throw new AppError("User not found", 404);
    }

    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      throw new AppError("Invalid password", 400);
    }

    logger.info(`Login successful for user ${email}`);
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET!,
      {
        expiresIn: "1h",
      }
    );
    return { user, token };
  }
}

export const authService = new AuthService();
