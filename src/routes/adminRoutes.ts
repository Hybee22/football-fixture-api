import express from "express";
import { adminController } from "../controllers/adminController";
import { authenticateAndisSuperAdmin } from "../middleware/authMiddleware";

const router = express.Router();

router.post(
  "/create-admin",
  authenticateAndisSuperAdmin,
  adminController.createAdmin
);

export default router;
