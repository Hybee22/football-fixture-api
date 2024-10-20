import { NextFunction, Request, Response } from "express";
import { fixtureService } from "../services/fixtureService";

export const createFixture = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const fixture = await fixtureService.createFixture(req.body);
    res.status(201).json(fixture);
  } catch (error) {
    next(error);
  }
};

export const getAllFixtures = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const fixtures = await fixtureService.getAllFixtures(page, limit);
    res
      .status(200)
      .json({ message: "Fixtures fetched successfully", data: fixtures });
  } catch (error) {
    next(error);
  }
};

export const getFixtureById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const fixture = await fixtureService.getFixtureById(req.params.id);
    if (!fixture) {
      return res.status(404).json({ message: "Fixture not found" });
    }
    res.status(200).json(fixture);
  } catch (error) {
    next(error);
  }
};

export const updateFixture = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const fixture = await fixtureService.updateFixture(req.params.id, req.body);
    if (!fixture) {
      return res.status(404).json({ message: "Fixture not found" });
    }
    res.status(200).json(fixture);
  } catch (error) {
    next(error);
  }
};

export const deleteFixture = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const fixture = await fixtureService.deleteFixture(req.params.id);
    if (!fixture) {
      return res.status(404).json({ message: "Fixture not found" });
    }
    res.status(200).json({ message: "Fixture deleted successfully" });
  } catch (error) {
    next(error);
  }
};

export const getPendingFixtures = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const pendingFixtures = await fixtureService.getPendingFixtures(
      page,
      limit
    );
    res.status(200).json({
      message: "Pending fixtures fetched successfully",
      data: pendingFixtures,
    });
  } catch (error) {
    next(error);
  }
};

export const getCompletedFixtures = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const completedFixtures = await fixtureService.getCompletedFixtures(
      page,
      limit
    );
    res.status(200).json({
      message: "Completed fixtures fetched successfully",
      data: completedFixtures,
    });
  } catch (error) {
    next(error);
  }
};

export const getFixtureByUniqueLink = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { uniqueLink } = req.params;
    const fixture = await fixtureService.getFixtureByUniqueLink(uniqueLink);
    if (!fixture) {
      return res.status(404).json({ message: "Fixture not found" });
    }
    res.status(200).json({ message: "Fixture fetched successfully", data: fixture });
  } catch (error) {
    next(error);
  }
};
