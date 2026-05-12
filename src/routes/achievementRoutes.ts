import { Router } from "express";
import {
  createAchievement,
  deleteAchievement,
  getAchievements,
  updateAchievement
} from "../controllers/achievementController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

router.get("/", getAchievements);
router.post("/", authMiddleware, createAchievement);
router.put("/:id", authMiddleware, updateAchievement);
router.delete("/:id", authMiddleware, deleteAchievement);

export default router;
