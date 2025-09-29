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

    // For direct messages, create a name with both users
    let conversationName = data.name;
    if (conversationType === ConversationType.DIRECT && allMemberIds.length === 2) {
      // Get the user names for proper direct message naming
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

    // Notify all members about the new conversation via WebSocket
    try {
      const wsService = getWebSocketService();
      console.log("WebSocket service available:", !!wsService);
      
      if (wsService) {
        // Send notification to all members except the creator
        const memberIds = allMemberIds.filter(id => id !== userId);
        console.log("Sending conversation_created to users:", memberIds);
        console.log("New conversation data:", {
          id: conversation.id,
          name: serializedConversation.name,
          type: serializedConversation.type
        });
        
        if (memberIds.length > 0) {
          wsService.sendToUsers(memberIds, WebSocketEvent.CONVERSATION_CREATED, {
            conversation: serializedConversation
          });

          // Auto-join all members to the conversation room
          allMemberIds.forEach(memberId => {
            wsService.joinUserToConversation(memberId, conversation.id.toString());
          });
          
          console.log("WebSocket notification sent successfully");
        }
      } else {
        console.error("WebSocket service not available");
      }
    } catch (error) {
      console.error("Failed to send WebSocket notification:", error);
      // Don't fail the API request if WebSocket fails
    }

    res.status(201).json({
      message: SuccessMessage.CONVERSATION_CREATED,
      conversation: serializedConversation,
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