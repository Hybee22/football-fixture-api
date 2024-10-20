import { Request, Response, NextFunction } from "express";
import * as fixtureController from "../../controllers/fixtureController";
import { fixtureService } from "../../services/fixtureService";

jest.mock("../../services/fixtureService");

describe("Fixture Controller", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;
  let responseJson: jest.Mock;
  let responseStatus: jest.Mock;

  beforeEach(() => {
    mockRequest = {
      query: {},
      params: {},
      body: {},
    };
    responseJson = jest.fn();
    responseStatus = jest.fn().mockReturnValue({ json: responseJson });
    mockResponse = {
      status: responseStatus,
      json: responseJson,
    };
    mockNext = jest.fn();
  });

  describe("createFixture", () => {
    it("should create a fixture and return 201 status", async () => {
      const mockFixture = { id: "1", name: "Test Fixture" };
      (fixtureService.createFixture as jest.Mock).mockResolvedValue(
        mockFixture
      );

      mockRequest.body = { name: "Test Fixture" };
      await fixtureController.createFixture(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(responseStatus).toHaveBeenCalledWith(201);
      expect(responseJson).toHaveBeenCalledWith(mockFixture);
    });

    it("should call next with error on failure", async () => {
      const error = new Error("Creation failed");
      (fixtureService.createFixture as jest.Mock).mockRejectedValue(error);

      mockRequest.body = { name: "Test Fixture" };
      await fixtureController.createFixture(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe("getAllFixtures", () => {
    it("should return all fixtures with 200 status", async () => {
      const mockFixtures = [
        { id: "1", name: "Fixture 1" },
        { id: "2", name: "Fixture 2" },
      ];
      (fixtureService.getAllFixtures as jest.Mock).mockResolvedValue(
        mockFixtures
      );

      mockRequest.query = { page: "1", limit: "10" };
      await fixtureController.getAllFixtures(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(responseStatus).toHaveBeenCalledWith(200);
      expect(responseJson).toHaveBeenCalledWith({
        message: "Fixtures fetched successfully",
        data: mockFixtures,
      });
    });

    it("should call next with error on failure", async () => {
      const error = new Error("Database error");
      (fixtureService.getAllFixtures as jest.Mock).mockRejectedValue(error);

      mockRequest.query = { page: "1", limit: "10" };
      await fixtureController.getAllFixtures(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe("getFixtureById", () => {
    it("should return a fixture with 200 status", async () => {
      const mockFixture = { id: "1", name: "Test Fixture" };
      (fixtureService.getFixtureById as jest.Mock).mockResolvedValue(
        mockFixture
      );

      mockRequest.params = { id: "1" };
      await fixtureController.getFixtureById(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(responseStatus).toHaveBeenCalledWith(200);
      expect(responseJson).toHaveBeenCalledWith(mockFixture);
    });

    it("should return 404 status when fixture not found", async () => {
      (fixtureService.getFixtureById as jest.Mock).mockResolvedValue(null);

      mockRequest.params = { id: "1" };
      await fixtureController.getFixtureById(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(responseStatus).toHaveBeenCalledWith(404);
      expect(responseJson).toHaveBeenCalledWith({
        message: "Fixture not found",
      });
    });

    it("should call next with error on failure", async () => {
      const error = new Error("Database error");
      (fixtureService.getFixtureById as jest.Mock).mockRejectedValue(error);

      mockRequest.params = { id: "1" };
      await fixtureController.getFixtureById(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe("updateFixture", () => {
    it("should update a fixture and return 200 status", async () => {
      const mockFixture = { id: "1", name: "Updated Fixture" };
      (fixtureService.updateFixture as jest.Mock).mockResolvedValue(
        mockFixture
      );

      mockRequest.params = { id: "1" };
      mockRequest.body = { name: "Updated Fixture" };
      await fixtureController.updateFixture(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(responseStatus).toHaveBeenCalledWith(200);
      expect(responseJson).toHaveBeenCalledWith(mockFixture);
    });

    it("should return 404 status when fixture not found", async () => {
      (fixtureService.updateFixture as jest.Mock).mockResolvedValue(null);

      mockRequest.params = { id: "1" };
      mockRequest.body = { name: "Updated Fixture" };
      await fixtureController.updateFixture(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(responseStatus).toHaveBeenCalledWith(404);
      expect(responseJson).toHaveBeenCalledWith({
        message: "Fixture not found",
      });
    });

    it("should call next with error on failure", async () => {
      const error = new Error("Update failed");
      (fixtureService.updateFixture as jest.Mock).mockRejectedValue(error);

      mockRequest.params = { id: "1" };
      mockRequest.body = { name: "Updated Fixture" };
      await fixtureController.updateFixture(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe("deleteFixture", () => {
    it("should delete a fixture and return 200 status", async () => {
      (fixtureService.deleteFixture as jest.Mock).mockResolvedValue({
        id: "1",
        name: "Deleted Fixture",
      });

      mockRequest.params = { id: "1" };
      await fixtureController.deleteFixture(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(responseStatus).toHaveBeenCalledWith(200);
      expect(responseJson).toHaveBeenCalledWith({
        message: "Fixture deleted successfully",
      });
    });

    it("should return 404 status when fixture not found", async () => {
      (fixtureService.deleteFixture as jest.Mock).mockResolvedValue(null);

      mockRequest.params = { id: "1" };
      await fixtureController.deleteFixture(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(responseStatus).toHaveBeenCalledWith(404);
      expect(responseJson).toHaveBeenCalledWith({
        message: "Fixture not found",
      });
    });

    it("should call next with error on failure", async () => {
      const error = new Error("Delete failed");
      (fixtureService.deleteFixture as jest.Mock).mockRejectedValue(error);

      mockRequest.params = { id: "1" };
      await fixtureController.deleteFixture(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe("getPendingFixtures", () => {
    it("should return pending fixtures with 200 status", async () => {
      const mockPendingFixtures = [
        { id: "1", name: "Pending Fixture 1" },
        { id: "2", name: "Pending Fixture 2" },
      ];
      (fixtureService.getPendingFixtures as jest.Mock).mockResolvedValue(
        mockPendingFixtures
      );

      mockRequest.query = { page: "1", limit: "10" };
      await fixtureController.getPendingFixtures(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(responseStatus).toHaveBeenCalledWith(200);
      expect(responseJson).toHaveBeenCalledWith({
        message: "Pending fixtures fetched successfully",
        data: mockPendingFixtures,
      });
    });

    it("should call next with error on failure", async () => {
      const error = new Error("Database error");
      (fixtureService.getPendingFixtures as jest.Mock).mockRejectedValue(error);

      mockRequest.query = { page: "1", limit: "10" };
      await fixtureController.getPendingFixtures(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe("getCompletedFixtures", () => {
    it("should return completed fixtures with 200 status", async () => {
      const mockCompletedFixtures = [
        { id: "1", name: "Completed Fixture 1" },
        { id: "2", name: "Completed Fixture 2" },
      ];
      (fixtureService.getCompletedFixtures as jest.Mock).mockResolvedValue(
        mockCompletedFixtures
      );

      mockRequest.query = { page: "1", limit: "10" };
      await fixtureController.getCompletedFixtures(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(responseStatus).toHaveBeenCalledWith(200);
      expect(responseJson).toHaveBeenCalledWith({
        message: "Completed fixtures fetched successfully",
        data: mockCompletedFixtures,
      });
    });

    it("should call next with error on failure", async () => {
      const error = new Error("Database error");
      (fixtureService.getCompletedFixtures as jest.Mock).mockRejectedValue(
        error
      );

      mockRequest.query = { page: "1", limit: "10" };
      await fixtureController.getCompletedFixtures(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe("getFixtureByUniqueLink", () => {
    it("should return a fixture when a valid uniqueLink is provided", async () => {
      const mockFixture = {
        id: "1",
        homeTeam: "Team A",
        awayTeam: "Team B",
        uniqueLink: "abc123",
      };
      mockRequest.params = { uniqueLink: "abc123" };
      (fixtureService.getFixtureByUniqueLink as jest.Mock).mockResolvedValue(
        mockFixture
      );

      await fixtureController.getFixtureByUniqueLink(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Fixture fetched successfully",
        data: mockFixture,
      });
    });

    it("should return 404 when fixture is not found", async () => {
      mockRequest.params = { uniqueLink: "nonexistent" };
      (fixtureService.getFixtureByUniqueLink as jest.Mock).mockResolvedValue(
        null
      );

      await fixtureController.getFixtureByUniqueLink(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Fixture not found",
      });
    });

    it("should call next with error on failure", async () => {
      const error = new Error("Database error");
      mockRequest.params = { uniqueLink: "abc123" };
      (fixtureService.getFixtureByUniqueLink as jest.Mock).mockRejectedValue(
        error
      );

      await fixtureController.getFixtureByUniqueLink(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });
});
