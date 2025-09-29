import { Router } from "express";
import { authenticateToken } from "../middleware/auth.js";
import { validate } from "../utils/validation.js";
import { 
  createMessageSchema, 
  editMessageSchema, 
  messageParamsSchema,
  conversationParamsSchema 
} from "../validations/messageSchemas.js";
import * as messageController from "@/controllers/messageController";

const router = Router();

router.get("/conversations/:conversationId", authenticateToken, validate({ params: conversationParamsSchema }), messageController.getConversationMessages);
router.post("/", authenticateToken, validate({ body: createMessageSchema }), messageController.createMessage);
router.put("/:messageId", authenticateToken, validate({ params: messageParamsSchema, body: editMessageSchema }), messageController.editMessage);
router.delete("/:messageId", authenticateToken, validate({ params: messageParamsSchema }), messageController.deleteMessage);

export default router;