import { db } from "@/config/db";
import { messages } from "@/services/db/schemas/messages";
import { conversations } from "@/services/db/schemas/conversations";
import { conversationMembers } from "@/services/db/schemas/conversationMembers";
import { users } from "@/services/db/schemas/users";
import { dbRequest } from "@/services/db/dbRequest";
import { CACHE_CONFIG } from "@/config/cache";
import { eq, and, desc, or, sql } from "drizzle-orm";
import { generateSnowflake } from "@/utils/snowflake";

export interface CreateMessageData {
  conversation_id: string;
  content: string;
  message_type?: string;
  metadata?: any;
  parent_id?: string;
}

export interface EditMessageData {
  message_id: string;
  content: string;
  metadata?: any;
}

export const createMessage = async (senderId: string, messageData: CreateMessageData) => {
  const messageId = generateSnowflake();
  
  const newMessage = {
    id: messageId,
    conversationId: BigInt(messageData.conversation_id),
    senderId: BigInt(senderId),
    content: messageData.content,
    messageType: messageData.message_type || "text",
    metadata: messageData.metadata,
    parentId: messageData.parent_id ? BigInt(messageData.parent_id) : null,
  };

  const result = await db.insert(messages).values(newMessage).returning() as any[];
  const message = result[0];
  
  // Get full message with sender info
  const fullMessage = await getMessageById(message.id.toString());
  return fullMessage;
};

export const editMessage = async (senderId: string, messageData: EditMessageData) => {
  const messageId = BigInt(messageData.message_id);
  
  // Verify the message belongs to the sender
  const existingMessage = await db
    .select()
    .from(messages)
    .where(and(
      eq(messages.id, messageId),
      eq(messages.senderId, BigInt(senderId))
    ));

  if (existingMessage.length === 0) {
    throw new Error("Message not found or unauthorized");
  }

  // Update the message
  await db
    .update(messages)
    .set({
      content: messageData.content,
      metadata: messageData.metadata,
      updatedAt: new Date(),
    })
    .where(eq(messages.id, messageId));

  // Return updated message with sender info
  const updatedMessage = await getMessageById(messageData.message_id);
  return updatedMessage;
};

export const deleteMessage = async (senderId: string, messageId: string) => {
  const msgId = BigInt(messageId);
  
  // Verify the message belongs to the sender
  const existingMessage = await db
    .select()
    .from(messages)
    .where(and(
      eq(messages.id, msgId),
      eq(messages.senderId, BigInt(senderId))
    ));

  if (existingMessage.length === 0) {
    throw new Error("Message not found or unauthorized");
  }

  // Soft delete - mark as deleted in metadata
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

export const getMessageById = async (messageId: string) => {
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
      .where(eq(messages.id, BigInt(messageId)));
    
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
      .where(eq(messages.conversationId, BigInt(conversationId)))
      .orderBy(desc(messages.createdAt))
      .limit(limit)
      .offset(offset);
    
    return result.reverse(); // Return in chronological order
  }, CACHE_CONFIG.USER_TTL_MS);
};

export const verifyUserInConversation = async (userId: string, conversationId: string) => {
  const result = await db
    .select()
    .from(conversationMembers)
    .where(and(
      eq(conversationMembers.userId, BigInt(userId)),
      eq(conversationMembers.conversationId, BigInt(conversationId))
    ));
  
  return result.length > 0;
};