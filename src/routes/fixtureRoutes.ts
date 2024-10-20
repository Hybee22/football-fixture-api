import express from "express";
import {
  createFixture,
  getAllFixtures,
  getCompletedFixtures,
  getPendingFixtures,
  updateFixture,
  deleteFixture,
  getFixtureById,
  getFixtureByUniqueLink,
} from "../controllers/fixtureController";
import {
  authenticateAndisAdmin,
  authenticateSession,
} from "../middleware/authMiddleware";

const router = express.Router();

router.post("/", authenticateAndisAdmin, createFixture);
router.get("/", authenticateSession, getAllFixtures);
router.get("/completed", authenticateSession, getCompletedFixtures);
router.get("/pending", authenticateSession, getPendingFixtures);
router.get("/:id", authenticateSession, getFixtureById);
router.patch("/:id", authenticateAndisAdmin, updateFixture);
router.delete("/:id", authenticateAndisAdmin, deleteFixture);
router.get('/link/:uniqueLink', getFixtureByUniqueLink);

export default router;
