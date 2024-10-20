import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { AppError } from "../utils/customError";

dotenv.config();

interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export const authorizeAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (req.user?.role !== "admin" && req.user?.role !== "superadmin") {
    return res
      .status(403)
      .json({ message: "Access denied. Admin role required." });
  }
  next();
};

export const authorizeSuperAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (req.user?.role !== "superadmin") {
    return res
      .status(403)
      .json({ message: "Access denied. Super admin role required." });
  }
  next();
};

export const authenticateSession = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = (req.session as any).jwt;

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    // Verify the JWT token
    try {
      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) {
        throw new AppError("JWT_SECRET is not set", 500);
      }
      const decoded: any = jwt.verify(token, jwtSecret);
      (req as any).user = {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role,
      };
      next();
    } catch (err: any) {
      next(err);
    }
  } catch (error) {
    next(error);
  }
};

export const authenticateAndisAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  authenticateSession(req, res, (authError) => {
    if (authError) {
      return next(authError);
    }
    authorizeAdmin(req, res, next);
  });
};

export const authenticateAndisSuperAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  authenticateSession(req, res, (authError) => {
    if (authError) {
      return next(authError);
    }
    authorizeSuperAdmin(req, res, next);
  });
};
