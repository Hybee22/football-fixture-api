import Redis from "ioredis";
import logger from "./logger";

class RedisClient {
  private static instance: Redis | null = null;

  private constructor() {}

  public static getInstance(): Redis {
    if (!RedisClient.instance) {
      const redisUrl = process.env.REDIS_URL ?? "redis://localhost:6379";
      RedisClient.instance = new Redis(redisUrl);

      RedisClient.instance.on("error", (err) => {
        logger.error("Redis error:", err);
      });

      RedisClient.instance.on("connect", () => {
        logger.info("Connected to Redis");
      });
    }

    return RedisClient.instance;
  }

  public static async quit() {
    if (RedisClient.instance) {
      await new Promise<void>((resolve) => {
        RedisClient.instance?.quit(() => {
          resolve();
        });
      });
      RedisClient.instance = null;
    }
  }

  static reset() {
    RedisClient.instance = null;
  }
}

export default RedisClient;
