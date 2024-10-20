import { Request, Response, NextFunction } from "express";
import { teamService } from "../services/teamService";
import { teamSchema } from "../utils/validationSchemas";

export const createTeam = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { error } = teamSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const team = await teamService.createTeam(req.body);
    res.status(201).json({ message: "Team created successfully", data: team });
  } catch (error) {
    // Use next(error) instead of handling the error here
    next(error);
  }
};

export const getAllTeams = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const teams = await teamService.getAllTeams(page, limit);

    res
      .status(200)
      .json({ message: "Teams fetched successfully", data: teams });
  } catch (error) {
    next(error);
  }
};

export const getTeamById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const team = await teamService.getTeamById(req.params.id);
    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }
    res.status(200).json({ message: "Team fetched successfully", data: team });
  } catch (error) {
    next(error);
  }
};

export const updateTeam = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { error } = teamSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const team = await teamService.updateTeam(req.params.id, req.body);
    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }
    res.status(200).json({ message: "Team updated successfully", data: team });
  } catch (error) {
    next(error);
  }
};

export const deleteTeam = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const deleted = await teamService.deleteTeam(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Team not found" });
    }
    res.status(200).json({ message: "Team deleted successfully" });
  } catch (error) {
    next(error);
  }
};
