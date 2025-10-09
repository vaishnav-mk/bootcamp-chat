import { Request, Response } from "express";
import { asyncWrap } from "@/middleware/asyncWrap";
import { 
  getConversationMessages as getMessages, 
  verifyUserInConversation,
  createMessage as createMsg,
  editMessage as editMsg,
  deleteMessage as deleteMsg
} from "@/services/messageService";
import { ErrorMessage } from "@/constants/errors";
import { serializeBigInt } from "@/utils/serialization";
import { handleLLMResponse } from "@/services/llmHandler";
import * as conversationService from "@/services/conversationService";

export const getConversationMessages = asyncWrap(async (req: Request, res: Response) => {
  const { conversationId } = req.params;
  const { limit = 50, offset = 0 } = req.query;
  const userId = req.user!.id;

  const isMember = await verifyUserInConversation(userId, conversationId);
  if (!isMember) {
    return res.status(403).json({ error: ErrorMessage.NOT_IN_CONVERSATION });
  }

  const messages = await getMessages(
    conversationId,
    Number(limit),
    Number(offset)
  );

  res.json({ messages: serializeBigInt(messages) });
});

export const createMessage = asyncWrap(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const messageData = req.body;

  const isMember = await verifyUserInConversation(userId, messageData.conversation_id);
  if (!isMember) {
    return res.status(403).json({ error: ErrorMessage.NOT_IN_CONVERSATION });
  }

  const message = await createMsg(userId, messageData);
  
  try {
    const conversation = await conversationService.fetchConversationById(messageData.conversation_id);
    if (conversation) {
      handleLLMResponse(messageData.conversation_id, {
        id: conversation.id.toString(),
        type: conversation.type
      }, messageData.content).catch(error => {
        console.error("LLM response handling failed:", error);
      });
    }
  } catch (error) {
    console.error("Error checking conversation type for LLM response:", error);
  }

  res.status(201).json({ message: serializeBigInt(message) });
});

export const editMessage = asyncWrap(async (req: Request, res: Response) => {
  const { messageId } = req.params;
  const userId = req.user!.id;
  const messageData = { ...req.body, message_id: messageId };

  const message = await editMsg(userId, messageData);
  res.json({ message: serializeBigInt(message) });
});

export const deleteMessage = asyncWrap(async (req: Request, res: Response) => {
  const { messageId } = req.params;
  const userId = req.user!.id;

  const result = await deleteMsg(userId, messageId);
  res.json(result);
});