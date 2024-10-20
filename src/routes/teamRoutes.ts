import express from "express";
import {
  createTeam,
  deleteTeam,
  getTeamById,
  getAllTeams,
  updateTeam,
} from "../controllers/teamController";
import {
  authenticateAndisAdmin,
  authenticateSession,
} from "../middleware/authMiddleware";

const router = express.Router();

router.post("/", authenticateAndisAdmin, createTeam);
router.get("/", authenticateSession, getAllTeams);
router.patch("/:id", authenticateAndisAdmin, updateTeam);
router.delete("/:id", authenticateAndisAdmin, deleteTeam);
router.get("/:id", authenticateSession, getTeamById);

export default router;
