import { Request, Response } from "express";
import * as conversationService from "@/services/conversationService";
import { CreateConversationData } from "../models/conversationSchemas";
import { ErrorMessage } from "../constants/errors";
import { SuccessMessage } from "../constants/messages";

export const createConversation = async (req: Request, res: Response) => {
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

    if (data.type === 'group' && allMemberIds.length === 2) {
      conversationType = 'direct';
    }

    if (conversationType === 'direct' && allMemberIds.length === 2) {
      const existingConversation = await conversationService.findExistingDirectConversation(
        allMemberIds[0], 
        allMemberIds[1]
      );

      if (existingConversation) {
        const members = await conversationService.getConversationMembers(existingConversation.id.toString());
        
        return res.status(200).json({
          message: SuccessMessage.EXISTING_CONVERSATION_RETURNED,
          conversation: {
            id: existingConversation.id.toString(),
            type: existingConversation.type,
            name: existingConversation.name,
            createdBy: existingConversation.createdBy.toString(),
            createdAt: existingConversation.createdAt,
            members: members.map(member => ({
              id: member.id.toString(),
              email: member.email,
              username: member.username,
              name: member.name,
              avatar: member.avatar,
              createdAt: member.createdAt,
              updatedAt: member.updatedAt,
            })),
          },
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

    res.status(201).json({
      message: SuccessMessage.CONVERSATION_CREATED,
      conversation: {
        id: conversation.id.toString(),
        type: conversation.type,
        name: conversation.name,
        createdBy: conversation.createdBy.toString(),
        createdAt: conversation.createdAt,
        members: members.map(member => ({
          id: member.id.toString(),
          email: member.email,
          username: member.username,
          name: member.name,
          avatar: member.avatar,
          createdAt: member.createdAt,
          updatedAt: member.updatedAt,
        })),
      },
    });
  } catch (error) {
    console.error("Error occurred while creating conversation:", error);
    res.status(500).json({ error: ErrorMessage.FAILED_TO_CREATE_CONVERSATION });
  }
};

export const getUserConversations = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ error: ErrorMessage.UNAUTHORIZED });

  try {
    const conversations = await conversationService.getUserConversations(userId);
    
    const formattedConversations = await Promise.all(
      conversations.map(async (conversation) => {
        const members = await conversationService.getConversationMembers(conversation.id.toString());
        
        return {
          id: conversation.id.toString(),
          type: conversation.type,
          name: conversation.name,
          createdBy: conversation.createdBy.toString(),
          createdAt: conversation.createdAt,
          members: members.map(member => ({
            id: member.id.toString(),
            email: member.email,
            username: member.username,
            name: member.name,
            avatar: member.avatar,
            createdAt: member.createdAt,
            updatedAt: member.updatedAt,
          })),
        };
      })
    );

    res.json({
      conversations: formattedConversations,
    });
  } catch (error) {
    res.status(500).json({ error: ErrorMessage.FAILED_TO_FETCH_CONVERSATIONS });
  }
};