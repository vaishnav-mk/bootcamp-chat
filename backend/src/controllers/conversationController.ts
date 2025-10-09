import { Request, Response } from "express";
import * as conversationService from "@/services/conversationService";
import { CreateConversationData } from "../validations/conversationSchemas";
import { ErrorMessage } from "../constants/errors";
import { SuccessMessage } from "../constants/messages";
import { ConversationType, WebSocketEvent } from "../constants/enums";
import { serializeConversation } from "../utils/conversationSerializer";
import { serializeUsers } from "../utils/userSerializer";
import { asyncWrap } from "../middleware/asyncWrap.js";
import { getWebSocketService } from "@/services/wsServiceInstance";
import { HttpError } from "@/utils/httpError";

const createConversationHandler = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) throw new HttpError(401, ErrorMessage.UNAUTHORIZED);

  const data = req.validatedData as CreateConversationData;

  if (data.type === ConversationType.LLM) {
    const conversationName = data.name || "AI Assistant";
    const allMemberIds = [userId];

    const conversation = await conversationService.createConversation(
      userId,
      ConversationType.LLM,
      conversationName,
      allMemberIds
    );

    const members = await conversationService.getConversationMembers(conversation.id.toString());
    const serializedMembers = serializeUsers(members, true);
    const serializedConversation = serializeConversation(conversation, serializedMembers);

    try {
      const wsService = getWebSocketService();
      if (wsService) {
        wsService.joinUserToConversation(userId, conversation.id.toString());
      }
    } catch (error) {
      console.error("Failed to send WebSocket notification for LLM conversation:", error);
    }

    return res.status(201).json({
      message: SuccessMessage.CONVERSATION_CREATED,
      conversation: serializedConversation,
    });
  }

  const allMemberIds = [...new Set([userId, ...data.member_ids])];

  const validUsers = await conversationService.validateMemberIds(allMemberIds);
  if (!validUsers) {
    throw new HttpError(400, ErrorMessage.INVALID_MEMBER_IDS);
  }

  let conversationType = data.type;

  if (data.type === ConversationType.GROUP && allMemberIds.length === 2) {
    conversationType = ConversationType.DIRECT;
  }

  if (conversationType === ConversationType.DIRECT && allMemberIds.length === 2) {
    const existingConversation = await conversationService.findExistingDirectConversation(
      allMemberIds[0],
      allMemberIds[1]
    );

    if (existingConversation) {
      const members = await conversationService.getConversationMembers(existingConversation.id.toString());
      const serializedMembers = serializeUsers(members, true);

      return res.status(200).json({
        message: SuccessMessage.EXISTING_CONVERSATION_RETURNED,
        conversation: serializeConversation(existingConversation, serializedMembers),
      });
    }
  }

  let conversationName = data.name;
  if (conversationType === ConversationType.DIRECT && allMemberIds.length === 2) {
    const memberUsers = await conversationService.getUsersByIds(allMemberIds);
    conversationName = memberUsers.map((u: { name: string }) => u.name).sort().join(", ");
  }

  const conversation = await conversationService.createConversation(
    userId,
    conversationType,
    conversationName,
    allMemberIds
  );

  const members = await conversationService.getConversationMembers(conversation.id.toString());
  const serializedMembers = serializeUsers(members, true);
  const serializedConversation = serializeConversation(conversation, serializedMembers);

  try {
    const wsService = getWebSocketService();

    if (wsService) {
      const memberIds = allMemberIds.filter(id => id !== userId);

      if (memberIds.length > 0) {
        wsService.sendToUsers(memberIds, WebSocketEvent.CONVERSATION_CREATED, {
          conversation: serializedConversation
        });

        allMemberIds.forEach(memberId => {
          wsService.joinUserToConversation(memberId, conversation.id.toString());
        });
      }
    } else {
      console.error("WebSocket service not available");
    }
  } catch (error) {
    console.error("Failed to send WebSocket notification:", error);
  }

  res.status(201).json({
    message: SuccessMessage.CONVERSATION_CREATED,
    conversation: serializedConversation,
  });
};

const getUserConversationsHandler = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ error: ErrorMessage.UNAUTHORIZED });

  try {
    const conversations = await conversationService.getUserConversations(userId);
    
    const formattedConversations = await Promise.all(
      conversations.map(async (conversation) => {
        const members = await conversationService.getConversationMembers(conversation.id.toString());
        const serializedMembers = serializeUsers(members, true);
        return serializeConversation(conversation, serializedMembers);
      })
    );

    res.json({
      conversations: formattedConversations,
    });
  } catch (error) {
    res.status(500).json({ error: ErrorMessage.FAILED_TO_FETCH_CONVERSATIONS });
  }
};

export const createConversation = asyncWrap(createConversationHandler);
export const getUserConversations = asyncWrap(getUserConversationsHandler);