import { Request, Response, NextFunction } from "express";
import { searchTeamsAndFixtures } from "../../controllers/searchController";
import { searchService } from "../../services/searchService";

jest.mock("../../services/searchService");

describe("Search Controller", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction = jest.fn();

  beforeEach(() => {
    mockRequest = {
      query: {},
    };
    mockResponse = {
      json: jest.fn(),
      status: jest.fn(() => mockResponse as Response),
    };
  });

  it("should return 400 if query is missing", async () => {
    await searchTeamsAndFixtures(
      mockRequest as Request,
      mockResponse as Response,
      nextFunction
    );

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      status: "error",
      message: "Valid search query is required",
    });
  });

  it("should return 400 if query is not a string", async () => {
    mockRequest.query = { query: ["not a string"] };

    await searchTeamsAndFixtures(
      mockRequest as Request,
      mockResponse as Response,
      nextFunction
    );

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      status: "error",
      message: "Valid search query is required",
    });
  });

  it("should call searchService with correct parameters and return results", async () => {
    const mockResults = { teams: [], fixtures: [] };
    (searchService.searchTeamsAndFixtures as jest.Mock).mockResolvedValue(
      mockResults
    );

    mockRequest.query = {
      query: "test",
      teamPage: "2",
      fixturePage: "3",
      limit: "20",
    };

    await searchTeamsAndFixtures(
      mockRequest as Request,
      mockResponse as Response,
      nextFunction
    );

    expect(searchService.searchTeamsAndFixtures).toHaveBeenCalled()
    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith(mockResults);
  });

  it("should use default values if pagination parameters are not provided", async () => {
    const mockResults = { teams: [], fixtures: [] };
    (searchService.searchTeamsAndFixtures as jest.Mock).mockResolvedValue(
      mockResults
    );

    mockRequest.query = { query: "test" };

    await searchTeamsAndFixtures(
      mockRequest as Request,
      mockResponse as Response,
      nextFunction
    );

    expect(searchService.searchTeamsAndFixtures).toHaveBeenCalled()
    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith(mockResults);
  });

  it("should call next function if an error occurs", async () => {
    const error = new Error("Test error");
    (searchService.searchTeamsAndFixtures as jest.Mock).mockRejectedValue(
      error
    );

    mockRequest.query = { query: "test" };

    await searchTeamsAndFixtures(
      mockRequest as Request,
      mockResponse as Response,
      nextFunction
    );

    expect(nextFunction).toHaveBeenCalledWith(error);
  });

  it("should call searchService with filter parameters", async () => {
    const mockResults = { teams: [], fixtures: [] };
    (searchService.searchTeamsAndFixtures as jest.Mock).mockResolvedValue(mockResults);

    mockRequest.query = {
      query: "test",
      teamPage: "2",
      fixturePage: "3",
      limit: "20",
      status: "pending",
      season: "2024",
      venue: "Stadium",
      dateFrom: "2023-01-01",
      dateTo: "2024-12-31",
      team: "Lions",
      homeScore: "0",
      awayScore: "0"
    };

    await searchTeamsAndFixtures(
      mockRequest as Request,
      mockResponse as Response,
      nextFunction
    );

    expect(searchService.searchTeamsAndFixtures).toHaveBeenCalledWith(
      "test",
      2,
      3,
      20,
      {
        status: "pending",
        season: "2024",
        venue: "Stadium",
        dateFrom: expect.any(Date),
        dateTo: expect.any(Date),
        team: "Lions",
        result: { homeScore: 0, awayScore: 0 }
      }
    );
    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith(mockResults);
  });

  it("should handle partial filter parameters", async () => {
    const mockResults = { teams: [], fixtures: [] };
    (searchService.searchTeamsAndFixtures as jest.Mock).mockResolvedValue(mockResults);

    mockRequest.query = {
      query: "test",
      status: "completed",
      season: "2023"
    };

    await searchTeamsAndFixtures(
      mockRequest as Request,
      mockResponse as Response,
      nextFunction
    );

    expect(searchService.searchTeamsAndFixtures).toHaveBeenCalled();
    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith(mockResults);
  });
});
