import { Request, Response, NextFunction } from "express";
import * as teamController from "../../controllers/teamController";
import { teamService } from "../../services/teamService";
import { teamSchema } from "../../utils/validationSchemas";

jest.mock("../../services/teamService");
jest.mock("../../utils/validationSchemas");

describe("Team Controller", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction = jest.fn();

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      json: jest.fn(),
      status: jest.fn(() => mockResponse as Response),
    };
  });

  describe("createTeam", () => {
    it("should create a team successfully", async () => {
      const mockTeam = { id: "1", name: "Test Team" };
      mockRequest.body = mockTeam;
      (teamSchema.validate as jest.Mock).mockReturnValue({});
      (teamService.createTeam as jest.Mock).mockResolvedValue(mockTeam);

      await teamController.createTeam(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Team created successfully",
        data: mockTeam,
      });
    });

    it("should return 400 if validation fails", async () => {
      mockRequest.body = { invalidField: "invalid" };
      (teamSchema.validate as jest.Mock).mockReturnValue({
        error: { details: [{ message: "Validation error" }] },
      });

      await teamController.createTeam(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Validation error",
      });
    });
  });

  describe("getAllTeams", () => {
    it("should get all teams successfully", async () => {
      const mockTeams = [
        { id: "1", name: "Team 1" },
        { id: "2", name: "Team 2" },
      ];
      mockRequest.query = { page: "1", limit: "10" };
      (teamService.getAllTeams as jest.Mock).mockResolvedValue(mockTeams);

      await teamController.getAllTeams(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Teams fetched successfully",
        data: mockTeams,
      });
    });
  });

  describe("getTeamById", () => {
    it("should get a team by id successfully", async () => {
      const mockTeam = { id: "1", name: "Test Team" };
      mockRequest.params = { id: "1" };
      (teamService.getTeamById as jest.Mock).mockResolvedValue(mockTeam);

      await teamController.getTeamById(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Team fetched successfully",
        data: mockTeam,
      });
    });

    it("should return 404 if team not found", async () => {
      mockRequest.params = { id: "1" };
      (teamService.getTeamById as jest.Mock).mockResolvedValue(null);

      await teamController.getTeamById(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Team not found",
      });
    });
  });

  describe("updateTeam", () => {
    it("should update a team successfully", async () => {
      const mockTeam = { id: "1", name: "Updated Team" };
      mockRequest.params = { id: "1" };
      mockRequest.body = { name: "Updated Team" };
      (teamSchema.validate as jest.Mock).mockReturnValue({});
      (teamService.updateTeam as jest.Mock).mockResolvedValue(mockTeam);

      await teamController.updateTeam(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Team updated successfully",
        data: mockTeam,
      });
    });

    it("should return 400 if validation fails", async () => {
      mockRequest.params = { id: "1" };
      mockRequest.body = { invalidField: "invalid" };
      (teamSchema.validate as jest.Mock).mockReturnValue({
        error: { details: [{ message: "Validation error" }] },
      });

      await teamController.updateTeam(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Validation error",
      });
    });

    it("should return 404 if team not found", async () => {
      mockRequest.params = { id: "1" };
      mockRequest.body = { name: "Updated Team" };
      (teamSchema.validate as jest.Mock).mockReturnValue({});
      (teamService.updateTeam as jest.Mock).mockResolvedValue(null);

      await teamController.updateTeam(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Team not found",
      });
    });
  });

  describe("deleteTeam", () => {
    it("should delete a team successfully", async () => {
      mockRequest.params = { id: "1" };
      (teamService.deleteTeam as jest.Mock).mockResolvedValue(true);

      await teamController.deleteTeam(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Team deleted successfully",
      });
    });

    it("should return 404 if team not found", async () => {
      mockRequest.params = { id: "1" };
      (teamService.deleteTeam as jest.Mock).mockResolvedValue(false);

      await teamController.deleteTeam(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Team not found",
      });
    });
  });
});
