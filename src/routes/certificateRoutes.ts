import { Router } from "express";
import {
  createCertificate,
  deleteCertificate,
  getCertificates,
  updateCertificate
} from "../controllers/certificateController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

router.get("/", getCertificates);
router.post("/", authMiddleware, createCertificate);
router.put("/:id", authMiddleware, updateCertificate);
router.delete("/:id", authMiddleware, deleteCertificate);

export default router;
