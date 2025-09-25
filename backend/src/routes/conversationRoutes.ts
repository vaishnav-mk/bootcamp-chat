import { Router } from "express";
import { authenticateToken } from "../middleware/auth.js";
import { validate } from "../utils/validation.js";
import { createConversationSchema } from "../validations/conversationSchemas.js";
import { asyncWrap } from "../middleware/asyncWrap.js";
import { createConversation, getUserConversations } from "../controllers/conversationController.js";

const router = Router();

router.post("/", authenticateToken, validate({ body: createConversationSchema }), asyncWrap(createConversation));
router.get("/", authenticateToken, asyncWrap(getUserConversations));

export default router;