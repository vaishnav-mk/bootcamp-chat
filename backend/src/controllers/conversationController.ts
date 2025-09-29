import { Request, Response } from "express";
import * as conversationService from "@/services/conversationService";
import { CreateConversationData } from "../validations/conversationSchemas";
import { ErrorMessage } from "../constants/errors";
import { SuccessMessage } from "../constants/messages";
import { ConversationType } from "../constants/enums";
import { serializeConversation } from "../utils/conversationSerializer";
import { serializeUsers } from "../utils/userSerializer";
import { asyncWrap } from "../middleware/asyncWrap.js";

const createConversationHandler = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ error: ErrorMessage.UNAUTHORIZED });

  const data = req.validatedData as CreateConversationData;

  try {
    const allMemberIds = [...new Set([userId, ...data.member_ids])];

    const validUsers = await conversationService.validateMemberIds(allMemberIds);
    if (!validUsers) {
        return res.status(400).json({ error: ErrorMessage.INVALID_MEMBER_IDS });
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

    const conversation = await conversationService.createConversation(
      userId,
      conversationType,
      data.name,
      allMemberIds
    );

    const members = await conversationService.getConversationMembers(conversation.id.toString());
    const serializedMembers = serializeUsers(members, true);

    res.status(201).json({
      message: SuccessMessage.CONVERSATION_CREATED,
      conversation: serializeConversation(conversation, serializedMembers),
    });
  } catch (error) {
    console.error("Error occurred while creating conversation:", error);
    res.status(500).json({ error: ErrorMessage.FAILED_TO_CREATE_CONVERSATION });
  }
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