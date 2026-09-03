import { Router } from "express";
import {
  createPost,
  deletePost,
  getFeaturedPosts,
  getPostBySlug,
  getPosts,
  updatePost
} from "../controllers/postController";
import { authMiddleware, optionalAuthMiddleware } from "../middleware/authMiddleware";

const router = Router();

router.get("/", optionalAuthMiddleware, getPosts);
router.get("/featured", getFeaturedPosts);
router.get("/:slug", optionalAuthMiddleware, getPostBySlug);
router.post("/", authMiddleware, createPost);
router.put("/:id", authMiddleware, updatePost);
router.delete("/:id", authMiddleware, deletePost);

export default router;
