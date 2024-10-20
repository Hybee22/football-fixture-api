import express from "express";
import { searchTeamsAndFixtures } from "../controllers/searchController";

const router = express.Router();

router.get("/", searchTeamsAndFixtures);

export default router;
