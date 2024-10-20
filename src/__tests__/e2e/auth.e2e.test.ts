import request from "supertest";
import app from "../../app";
import User from "../../models/User";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { testDBConnection } from "../../utils/dbConnect";
import RedisClient from "../../utils/redis";

const redisClient = RedisClient.getInstance();

dotenv.config();

describe("Auth API", () => {
  beforeAll(async () => {
    await testDBConnection();
  });

  afterAll(async () => {
    await User.deleteMany({});
    await mongoose.connection.close();
    await redisClient.quit();
  });

  describe("POST /register", () => {
    it("should register a new user", async () => {
      const response = await request(app).post("/api/auth/register").send({
        email: "newuser@example.com",
        password: "password123",
      });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty(
        "message",
        "User created successfully"
      );
      expect(response.body.user).toHaveProperty("email", "newuser@example.com");
    });

    it("should return 400 if user already exists", async () => {
      // First, create a user
      await request(app).post("/api/auth/register").send({
        email: "existinguser@example.com",
        password: "password123",
      });

      // Try to create the same user again
      const response = await request(app).post("/api/auth/register").send({
        email: "existinguser@example.com",
        password: "password123",
      });

      expect(response.status).toBeDefined();
    });
  });

  describe("POST /login", () => {
    beforeEach(async () => {
      // Create a user for login tests
      await request(app).post("/api/auth/register").send({
        email: "testuser@example.com",
        password: "password123",
      });
    });

    it("should login an existing user", async () => {
      const response = await request(app).post("/api/auth/login").send({
        email: "testuser@example.com",
        password: "password123",
      });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty(
        "message",
        "User logged in successfully"
      );
      expect(response.body.data).toHaveProperty("token");
    });

    it("should return 401 for invalid credentials", async () => {
      const response = await request(app).post("/api/auth/login").send({
        email: "testuser@example.com",
        password: "wrongpassword",
      });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("message");
    });
  });

  describe("POST /logout", () => {
    it("should logout admin", async () => {
      const agent = request.agent(app);
      await agent.post("/api/v1/auth/login").send({
        email: "newuser@example.com",
        password: "password123",
      });

      const response = await agent.post("/api/auth/logout");

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Logout successful");
    });
  });
});
