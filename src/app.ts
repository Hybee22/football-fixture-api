import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import { errorHandler } from "./middleware/errorHandler";
import { rateLimiter } from "./middleware/rateLimiter";
import authRoutes from "./routes/authRoutes";
import teamRoutes from "./routes/teamRoutes";
import fixtureRoutes from "./routes/fixtureRoutes";
import searchRoutes from "./routes/searchRoutes";
import session from "express-session";
import RedisStore from "connect-redis";
import RedisClient from "./utils/redis";
import logger from "./utils/logger";
import adminRoutes from './routes/adminRoutes';

const redisClient = RedisClient.getInstance();

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use("/api", rateLimiter);

app.use(
  session({
    store: new RedisStore({ client: redisClient }),
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24, // 1 day
    },
  })
);

app.use((req, _, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/teams", teamRoutes);
app.use("/api/fixtures", fixtureRoutes);
app.use("/api/search", searchRoutes);
app.use('/api/admin', adminRoutes);

// Error handling middleware
app.use(errorHandler);

const dbConnectionString = process.env.NODE_ENV !== "test" ? process.env.MONGODB_URI : process.env.TEST_MONGODB_URI;
mongoose
  .connect(dbConnectionString ?? "", {
    serverSelectionTimeoutMS: 50000,
    socketTimeoutMS: 45000,
  })
  .then(() => logger.info("Connected to MongoDB"))
  .catch((error) => logger.error("MongoDB connection error:", error));

mongoose.connection.on("disconnected", () => {
  logger.warn("Lost MongoDB connection. Reconnecting...");
});

mongoose.connection.on("reconnected", () => {
  logger.info("Reconnected to MongoDB");
});

export default app;
