import { Router } from "express";
import { createReaction, getPostReactions } from "../controllers/reactionController";

const router = Router();

router.get("/posts/:postId/reactions", getPostReactions);
router.post("/posts/:postId/reactions", createReaction);

export default router;
