import { Request, Response, NextFunction } from "express";
import RedisClient from "../utils/redis";

const redisClient = RedisClient.getInstance();

export const rateLimiter = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const ip = req.ip ?? req.socket.remoteAddress ?? "unknown";
  try {
    const [[, requestCount]] = (await redisClient
      .multi()
      .incr(ip)
      .expire(ip, 60)
      .exec()) as [[null, number], [null, number]];

    if (requestCount > 100) {
      return res.status(429).json({ message: "Too many requests" });
    }

    next();
  } catch (error) {
    console.error("Rate limiter error:", error);
    next();
  }
};
