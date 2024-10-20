import { Request, Response } from "express";
import { register, login } from "../../controllers/authController";
import { authService } from "../../services/authService";
import { Session, SessionData } from "express-session";

jest.mock("../../services/authService");

describe("AuthController", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: jest.Mock;

  beforeEach(() => {
    mockRequest = {
      body: {},
      session: {
        user: { role: "" },
      } as unknown as Session & Partial<SessionData>,
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    nextFunction = jest.fn();
  });

  describe("register", () => {
    it("should register a user successfully", async () => {
      const userData = { email: "test@example.com", password: "password123" };
      mockRequest.body = userData;
      const mockUser = { id: "1", email: "test@example.com" };

      (authService.registerUser as jest.Mock).mockResolvedValue(mockUser);

      await register(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(authService.registerUser).toHaveBeenCalledWith(userData);
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "User created successfully",
        user: mockUser,
      });
    });

    it("should call next with error if registration fails", async () => {
      const error = new Error("Registration failed");
      (authService.registerUser as jest.Mock).mockRejectedValue(error);

      await register(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(nextFunction).toHaveBeenCalledWith(error);
    });
  });

  describe("login", () => {
    it("should login a user successfully", async () => {
      const loginData = { email: "test@example.com", password: "password123" };
      mockRequest.body = loginData;
      const mockUser = {
        user: { id: "1", email: "test@example.com" },
        token: "mock-jwt-token",
      };

      (authService.loginUser as jest.Mock).mockResolvedValue(mockUser);

      await login(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(authService.loginUser).toHaveBeenCalledWith(
        loginData.email,
        loginData.password
      );
      expect(mockRequest.session).toHaveProperty("jwt", "mock-jwt-token");
      expect(mockRequest.session).toHaveProperty("user", mockUser.user);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "User logged in successfully",
        data: { token: "mock-jwt-token" },
      });
    });

    it("should call next with error if login fails", async () => {
      const error = new Error("Login failed");
      (authService.loginUser as jest.Mock).mockRejectedValue(error);

      await login(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(nextFunction).toHaveBeenCalledWith(error);
    });
  });
});
