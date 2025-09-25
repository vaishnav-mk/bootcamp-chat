import { db } from "@/config/db";
import { conversations } from "@/services/db/schemas/conversations";
import { conversationMembers } from "@/services/db/schemas/conversationMembers";
import { users } from "@/services/db/schemas/users";
import { dbRequest } from "@/services/db/dbRequest";
import { CACHE_CONFIG } from "@/config/cache";
import { eq, inArray, desc, and, sql } from "drizzle-orm";
import { generateSnowflake } from "../utils/snowflake.js";

export const createConversation = async (
  createdBy: string,
  type: string,
  name: string | undefined,
  memberIds: string[]
) => {
  const conversationId = generateSnowflake();
  
  const newConversation = {
    id: conversationId,
    type,
    name,
    createdBy: BigInt(createdBy),
  };

  const [conversation] = await db.insert(conversations).values(newConversation).returning();

  const memberEntries = memberIds.map(memberId => ({
    conversationId,
    userId: BigInt(memberId),
  }));

  await db.insert(conversationMembers).values(memberEntries);

  return conversation;
};

export const fetchConversationById = async (id: string) => {
  return dbRequest(`conversation:${id}`, async () => {
    const result = await db.select().from(conversations).where(eq(conversations.id, BigInt(id)));
    return result[0] || null;
  }, CACHE_CONFIG.USER_TTL_MS);
};

export const validateMemberIds = async (memberIds: string[]) => {
  const result = await db
    .select({ id: users.id })
    .from(users)
    .where(inArray(users.id, memberIds.map(id => BigInt(id))));
  
  return result.length === memberIds.length;
};

export const getUserConversations = async (userId: string) => {
  return dbRequest(`user_conversations:${userId}`, async () => {
    const result = await db
      .select({
        id: conversations.id,
        type: conversations.type,
        name: conversations.name,
        createdBy: conversations.createdBy,
        createdAt: conversations.createdAt,
      })
      .from(conversations)
      .innerJoin(conversationMembers, eq(conversations.id, conversationMembers.conversationId))
      .where(eq(conversationMembers.userId, BigInt(userId)))
      .orderBy(desc(conversations.createdAt));
    
    return result;
  }, CACHE_CONFIG.USER_TTL_MS);
};

export const findExistingDirectConversation = async (userId1: string, userId2: string) => {
  const cacheKey = `direct_conversation:${[userId1, userId2].sort().join(':')}`;
  
  return dbRequest(cacheKey, async () => {
    const result = await db
      .select({
        id: conversations.id,
        type: conversations.type,
        name: conversations.name,
        createdBy: conversations.createdBy,
        createdAt: conversations.createdAt,
      })
      .from(conversations)
      .innerJoin(conversationMembers, eq(conversations.id, conversationMembers.conversationId))
      .where(
        and(
          eq(conversations.type, 'direct'),
          inArray(conversationMembers.userId, [BigInt(userId1), BigInt(userId2)])
        )
      )
      .groupBy(conversations.id, conversations.type, conversations.name, conversations.createdBy, conversations.createdAt)
      .having(sql`COUNT(DISTINCT ${conversationMembers.userId}) = 2`);
    
    return result[0] || null;
  }, CACHE_CONFIG.USER_TTL_MS);
};

export const getConversationMembers = async (conversationId: string) => {
  return dbRequest(`conversation_members:${conversationId}`, async () => {
    const result = await db
      .select({
        id: users.id,
        email: users.email,
        username: users.username,
        name: users.name,
        avatar: users.avatarPath,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(conversationMembers)
      .innerJoin(users, eq(conversationMembers.userId, users.id))
      .where(eq(conversationMembers.conversationId, BigInt(conversationId)));
    
    return result;
  }, CACHE_CONFIG.USER_TTL_MS);
};