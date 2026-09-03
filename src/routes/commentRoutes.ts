import { Router } from "express";
import {
  createComment,
  deleteComment,
  getComments,
  updateCommentStatus
} from "../controllers/commentController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

router.get("/comments", authMiddleware, getComments);
router.post("/posts/:postId/comments", createComment);
router.patch("/comments/:id/status", authMiddleware, updateCommentStatus);
router.delete("/comments/:id", authMiddleware, deleteComment);

export default router;
