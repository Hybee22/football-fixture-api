import { Request, Response } from "express";
import User from "../models/User";
import { AppError } from "../utils/customError";

export class AdminController {
  async createAdmin(req: Request, res: Response) {
    const { email, password } = req.body;

    // Check if the requester is a superadmin
    const requestUser = (req.session as any).user;
    if (requestUser.role !== "superadmin") {
      throw new AppError("Only superadmin can create admin accounts", 403);
    }

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email });
    if (existingAdmin) {
      throw new AppError("Admin with this email already exists", 400);
    }

    // Create new admin
    const newAdmin = new User({
      email,
      password,
      role: "admin",
    });

    await newAdmin.save();

    res.status(201).json({
      message: "Admin created successfully",
      data: {
        email: newAdmin.email,
        role: newAdmin.role,
      },
    });
  }
}

export const adminController = new AdminController();
