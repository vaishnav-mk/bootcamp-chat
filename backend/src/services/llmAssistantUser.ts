import { db } from "@/config/db";
import { users } from "@/services/db/schemas/users";
import { eq } from "drizzle-orm";

let llmAssistantId: string | null = null;

export const getLLMAssistantId = async (): Promise<string> => {
  if (llmAssistantId) {
    return llmAssistantId;
  }

  try {
    const result = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.username, "ai_assistant"))
      .limit(1);

    if (result.length > 0) {
      llmAssistantId = result[0].id.toString();
      return llmAssistantId;
    }

    throw new Error("LLM Assistant user not found. Please run the seed script.");
  } catch (error) {
    throw error;
  }
};