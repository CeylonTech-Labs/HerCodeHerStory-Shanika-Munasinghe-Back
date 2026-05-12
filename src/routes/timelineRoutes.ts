import { Router } from "express";
import {
  createTimelineEvent,
  deleteTimelineEvent,
  getTimelineEvents,
  updateTimelineEvent
} from "../controllers/timelineController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

router.get("/", getTimelineEvents);
router.post("/", authMiddleware, createTimelineEvent);
router.put("/:id", authMiddleware, updateTimelineEvent);
router.delete("/:id", authMiddleware, deleteTimelineEvent);

export default router;
