import { db } from "@/config/db";
import { messages } from "@/services/db/schemas/messages";
import { conversationMembers } from "@/services/db/schemas/conversationMembers";
import { users } from "@/services/db/schemas/users";
import { dbRequest } from "@/services/db/dbRequest";
import { CACHE_CONFIG } from "@/config/cache";
import { eq, and, desc, sql } from "drizzle-orm";
import { generateSnowflake } from "@/utils/snowflake";
import { ErrorMessage } from "@/constants/errors";
import { MessageType } from "@/constants/enums";
import { toBigInt } from "@/utils/dbHelpers";
import { CreateMessageData, EditMessageData } from "@/types";

export const createMessage = async (senderId: string, messageData: CreateMessageData) => {
  const messageId = generateSnowflake();
  
  const newMessage = {
    id: messageId,
    conversationId: toBigInt(messageData.conversation_id),
    senderId: toBigInt(senderId),
    content: messageData.content,
    messageType: messageData.message_type || MessageType.TEXT,
    metadata: messageData.metadata,
    parentId: messageData.parent_id ? toBigInt(messageData.parent_id) : null,
  };

  const result = await db.insert(messages).values(newMessage).returning() as any[];
  const message = result[0];
  
  return await getMessageById(message.id.toString());
};

export const editMessage = async (senderId: string, messageData: EditMessageData) => {
  const messageId = toBigInt(messageData.message_id);
  
  const existingMessage = await db
    .select()
    .from(messages)
    .where(and(
      eq(messages.id, messageId),
      eq(messages.senderId, toBigInt(senderId))
    ));

  if (existingMessage.length === 0) {
    throw new Error(ErrorMessage.MESSAGE_NOT_FOUND);
  }

  await db
    .update(messages)
    .set({
      content: messageData.content,
      metadata: messageData.metadata,
      updatedAt: new Date(),
    })
    .where(eq(messages.id, messageId));

  return await getMessageById(messageData.message_id);
};

export const deleteMessage = async (senderId: string, messageId: string) => {
  const msgId = toBigInt(messageId);
  
  const existingMessage = await db
    .select()
    .from(messages)
    .where(and(
      eq(messages.id, msgId),
      eq(messages.senderId, toBigInt(senderId))
    ));

  if (existingMessage.length === 0) {
    throw new Error(ErrorMessage.MESSAGE_NOT_FOUND);
  }

  await db
    .update(messages)
    .set({
      content: null,
      metadata: sql`COALESCE(${messages.metadata}, '{}'::jsonb) || '{"deleted": true, "deletedAt": "${new Date().toISOString()}"}'::jsonb`,
      updatedAt: new Date(),
    })
    .where(eq(messages.id, msgId));

  return { message_id: messageId, deleted: true };
};

const getMessageById = async (messageId: string) => {
  return dbRequest(`message:${messageId}`, async () => {
    const result = await db
      .select({
        id: messages.id,
        conversationId: messages.conversationId,
        senderId: messages.senderId,
        parentId: messages.parentId,
        content: messages.content,
        messageType: messages.messageType,
        metadata: messages.metadata,
        createdAt: messages.createdAt,
        updatedAt: messages.updatedAt,
        threadOrder: messages.threadOrder,
        sender: {
          id: users.id,
          username: users.username,
          name: users.name,
          email: users.email,
          avatar: users.avatarPath,
        },
      })
      .from(messages)
      .innerJoin(users, eq(messages.senderId, users.id))
      .where(eq(messages.id, toBigInt(messageId)));
    
    return result[0] || null;
  }, CACHE_CONFIG.USER_TTL_MS);
};

export const getConversationMessages = async (conversationId: string, limit = 50, offset = 0) => {
  return dbRequest(`conversation_messages:${conversationId}:${limit}:${offset}`, async () => {
    const result = await db
      .select({
        id: messages.id,
        conversationId: messages.conversationId,
        senderId: messages.senderId,
        parentId: messages.parentId,
        content: messages.content,
        messageType: messages.messageType,
        metadata: messages.metadata,
        createdAt: messages.createdAt,
        updatedAt: messages.updatedAt,
        threadOrder: messages.threadOrder,
        sender: {
          id: users.id,
          username: users.username,
          name: users.name,
          email: users.email,
          avatar: users.avatarPath,
        },
      })
      .from(messages)
      .innerJoin(users, eq(messages.senderId, users.id))
      .where(eq(messages.conversationId, toBigInt(conversationId)))
      .orderBy(desc(messages.createdAt))
      .limit(limit)
      .offset(offset);
    
    return result.reverse();
  }, CACHE_CONFIG.USER_TTL_MS);
};

export const verifyUserInConversation = async (userId: string, conversationId: string) => {
  const result = await db
    .select()
    .from(conversationMembers)
    .where(and(
      eq(conversationMembers.userId, toBigInt(userId)),
      eq(conversationMembers.conversationId, toBigInt(conversationId))
    ));
  
  return result.length > 0;
};