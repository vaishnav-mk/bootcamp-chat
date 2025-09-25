import { Router } from "express";
import { authenticateToken } from "../middleware/auth.js";
import { validateSchema } from "../utils/validation.js";
import { createConversationSchema } from "../models/conversationSchemas.js";
import { asyncWrap } from "../middleware/asyncWrap.js";
import { createConversation, getUserConversations } from "../controllers/conversationController.js";

const router = Router();

router.post("/", authenticateToken, validateSchema(createConversationSchema), asyncWrap(createConversation));
router.get("/", authenticateToken, asyncWrap(getUserConversations));

export default router;