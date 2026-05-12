import { Router } from "express";
import { deleteMedia, getMedia, uploadMedia } from "../controllers/mediaController";
import { authMiddleware } from "../middleware/authMiddleware";
import { upload } from "../middleware/uploadMiddleware";

const router = Router();

router.post("/upload", authMiddleware, upload.any(), uploadMedia);
router.get("/", getMedia);
router.delete("/:id", authMiddleware, deleteMedia);

export default router;
