import { db } from "@/config/db";
import { users } from "@/services/db/schemas/users";
import { dbRequest } from "@/services/db/dbRequest";
import { CACHE_CONFIG } from "@/config/cache";
import { clearCache } from "@/utils/cache";
import { eq } from "drizzle-orm";
import { generateSnowflake } from "../utils/snowflake.js";
import { toBigInt } from "../utils/dbHelpers";

export const fetchUserById = async (id: string | number) => {
  return dbRequest(`user:${id}`, async () => {
    const result = await db.select().from(users).where(eq(users.id, toBigInt(id)));
    return result[0] || null;
  }, CACHE_CONFIG.USER_TTL_MS);
};

export const fetchUserByEmail = async (email: string) => {
  return dbRequest(`user:email:${email}`, async () => {
    const result = await db.select().from(users).where(eq(users.email, email));
    return result[0] || null;
  }, CACHE_CONFIG.USER_TTL_MS);
};

export const fetchUserByUsername = async (username: string) => {
  return dbRequest(`user:username:${username}`, async () => {
    const result = await db.select().from(users).where(eq(users.username, username));
    return result[0] || null;
  }, CACHE_CONFIG.USER_TTL_MS);
};

export const createUser = async (userData: {
  email: string;
  passwordHash: string;
  username: string;
  name: string;
}) => {
  const id = generateSnowflake();
  const newUser = {
    id,
    email: userData.email,
    passwordHash: userData.passwordHash,
    username: userData.username,
    name: userData.name,
  };

  const result = await db.insert(users).values(newUser).returning();
  return result[0];
};

export const updateUserProfile = async (id: string, updates: {
  username?: string;
  name?: string;
}) => {
  const result = await db
    .update(users)
    .set({ ...updates, updatedAt: new Date() })
    .where(eq(users.id, toBigInt(id)))
    .returning();
  
  clearCache(`user:${id}`);
  
  return result[0];
};
