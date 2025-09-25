import { Router } from "express";
import { authenticateToken } from "../middleware/auth.js";
import { validate } from "../utils/validation.js";
import { createConversationSchema } from "../validations/conversationSchemas.js";
import { createConversation, getUserConversations } from "../controllers/conversationController.js";

const router = Router();

router.post("/", authenticateToken, validate({ body: createConversationSchema }), createConversation);
router.get("/", authenticateToken, getUserConversations);

export default router;