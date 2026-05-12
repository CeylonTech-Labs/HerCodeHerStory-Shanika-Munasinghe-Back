import { Router } from "express";
import {
  createProject,
  deleteProject,
  getProjectBySlug,
  getProjects,
  updateProject
} from "../controllers/projectController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

router.get("/", getProjects);
router.get("/:slug", getProjectBySlug);
router.post("/", authMiddleware, createProject);
router.put("/:id", authMiddleware, updateProject);
router.delete("/:id", authMiddleware, deleteProject);

export default router;
