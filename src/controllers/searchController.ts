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

    const results = await searchService.searchTeamsAndFixtures(query, teamPage, fixturePage, limit);
    res.status(200).json(results);
  } catch (error) {
    next(error);
  }
};
