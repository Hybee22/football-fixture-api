import { Request, Response } from "express";
import { AdminController } from "../../controllers/adminController";
import User from "../../models/User";
import { AppError } from "../../utils/customError";
import { Session, SessionData } from "express-session";

jest.mock("../../models/User");

describe("AdminController", () => {
  let adminController: AdminController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockUser: any;

  beforeEach(() => {
    adminController = new AdminController();
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
    mockUser = {
      email: "admin@example.com",
      role: "admin",
      save: jest.fn(),
    };
    (User.findOne as jest.Mock).mockReset();
    (User as any).mockReset();
  });

  describe("createAdmin", () => {
    it("should create a new admin when called by superadmin", async () => {
      mockRequest.body = {
        email: "newadmin@example.com",
        password: "password123",
      };
      (mockRequest.session as any).user = { role: "superadmin" };
      (User.findOne as jest.Mock).mockResolvedValue(null);
      (User as any).mockImplementation(() => mockUser);

      await adminController.createAdmin(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(User.findOne).toHaveBeenCalledWith({
        email: "newadmin@example.com",
      });
      expect(User).toHaveBeenCalledWith({
        email: "newadmin@example.com",
        password: "password123",
        role: "admin",
      });
      expect(mockUser.save).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Admin created successfully",
        data: {
          email: "admin@example.com",
          role: "admin",
        },
      });
    });

    it("should throw an error when called by non-superadmin", async () => {
      mockRequest.session = { user: { role: "admin" } } as unknown as Session &
        Partial<SessionData>;

      await expect(
        adminController.createAdmin(
          mockRequest as Request,
          mockResponse as Response
        )
      ).rejects.toThrow(
        new AppError("Only superadmin can create admin accounts", 403)
      );
    });

    it("should throw an error when admin already exists", async () => {
      mockRequest.body = {
        email: "existingadmin@example.com",
        password: "password123",
      };
      mockRequest.session = {
        user: { role: "superadmin" },
      } as unknown as Session & Partial<SessionData>;
      (User.findOne as jest.Mock).mockResolvedValue({
        email: "existingadmin@example.com",
      });

      await expect(
        adminController.createAdmin(
          mockRequest as Request,
          mockResponse as Response
        )
      ).rejects.toThrow(
        new AppError("Admin with this email already exists", 400)
      );
    });
  });
});
