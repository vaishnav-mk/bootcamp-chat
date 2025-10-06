import { db } from "@/config/db";
import { users } from "../services/db/schemas/users";
import { generateSnowflake } from "@/utils/snowflake";

const seedLLMAssistant = async () => {
  const llmUserId = generateSnowflake();
  
  const llmUser = {
    id: llmUserId,
    email: "llm-assistant@chat.app",
    passwordHash: "",
    username: "ai_assistant",
    name: "AI Assistant",
    avatarPath: "/avatars/llm-assistant.png",
    status: "online",
  };

  try {
    const result = await db
      .insert(users)
      .values(llmUser)
      .onConflictDoNothing()
      .returning();
    
    console.log("✅ Seeded LLM assistant user with ID:", llmUserId.toString());
    console.log("LLM Assistant User:", result[0]);
  } catch (error) {
    console.error("Error seeding LLM assistant:", error);
  }
};

seedLLMAssistant()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => process.exit());