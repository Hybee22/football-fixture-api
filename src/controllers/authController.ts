import { Request, Response, NextFunction } from "express";
import { authService } from "../services/authService";

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await authService.registerUser(req.body);
    res.status(201).json({ message: "User created successfully", user });
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;
    const user = await authService.loginUser(email, password);

    // Store JWT in the session
    if (user?.token) {
      (req.session as any).jwt = user.token;
      (req.session as any).user = user?.user;
    }

    res.status(200).json({
      message: "User logged in successfully",
      data: { token: user.token },
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.clearCookie("connect.sid");
      res.json({ message: "Logout successful" });
    });
  } catch (error) {
    next(error);
  }
};
