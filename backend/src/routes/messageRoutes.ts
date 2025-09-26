import { Router } from "express";
import { asyncWrap } from "@/middleware/asyncWrap";
import { authenticateToken } from "@/middleware/auth";
import { getConversationMessages } from "@/services/messageService";
import { verifyUserInConversation } from "@/services/messageService";
import { ErrorMessage } from "@/constants/errors";

const router = Router();

// Get messages for a conversation
router.get(
  "/conversations/:conversationId/messages",
  authenticateToken,
  asyncWrap(async (req, res) => {
    const { conversationId } = req.params;
    const { limit = 50, offset = 0 } = req.query;
    const userId = req.user!.id;

    // Verify user is a member of this conversation
    const isMember = await verifyUserInConversation(userId, conversationId);
    if (!isMember) {
      return res.status(403).json({ error: ErrorMessage.NOT_IN_CONVERSATION });
    }

    const messages = await getConversationMessages(
      conversationId,
      Number(limit),
      Number(offset)
    );

    res.json({ messages });
  })
);

export default router;