import { Router } from "express";
import { createTag, deleteTag, getTags } from "../controllers/tagController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

router.get("/", getTags);
router.post("/", authMiddleware, createTag);
router.delete("/:id", authMiddleware, deleteTag);

export default router;
