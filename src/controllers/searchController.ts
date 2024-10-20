import { NextFunction, Request, Response } from "express";
import { searchService } from "../services/searchService";

export const searchTeamsAndFixtures = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { query } = req.query;
    const teamPage = parseInt(req.query.teamPage as string) || 1;
    const fixturePage = parseInt(req.query.fixturePage as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    if (!query || typeof query !== "string") {
      return res.status(400).json({ status: 'error', message: "Valid search query is required" });
    }

    // Extract filter parameters from query
    const filters: any = {};
    if (req.query.status) filters.status = req.query.status as "pending" | "completed";
    if (req.query.season) filters.season = req.query.season as string;
    if (req.query.venue) filters.venue = req.query.venue as string;
    if (req.query.dateFrom) filters.dateFrom = new Date(req.query.dateFrom as string);
    if (req.query.dateTo) filters.dateTo = new Date(req.query.dateTo as string);
    if (req.query.team) filters.team = req.query.team as string;
    if (req.query.homeScore && req.query.awayScore) {
      filters.result = {
        homeScore: parseInt(req.query.homeScore as string),
        awayScore: parseInt(req.query.awayScore as string)
      };
    }

    const results = await searchService.searchTeamsAndFixtures(
      query, 
      teamPage, 
      fixturePage, 
      limit,
      filters
    );
    
    res.status(200).json(results);
  } catch (error) {
    next(error);
  }
};
