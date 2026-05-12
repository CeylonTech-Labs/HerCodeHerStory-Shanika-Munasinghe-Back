import { Router } from "express";
import {
  createContactMessage,
  deleteContactMessage,
  getContactMessages,
  updateContactMessageStatus
} from "../controllers/contactController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

router.post("/contact", createContactMessage);
router.get("/contact-messages", authMiddleware, getContactMessages);
router.patch("/contact-messages/:id/status", authMiddleware, updateContactMessageStatus);
router.delete("/contact-messages/:id", authMiddleware, deleteContactMessage);

export default router;
