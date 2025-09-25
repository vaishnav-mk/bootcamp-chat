import { pgTable, bigint, timestamp, primaryKey } from "drizzle-orm/pg-core";
import { conversations } from "./conversations";
import { users } from "./users";

export const conversationMembers = pgTable(
  "conversation_members",
  {
    conversationId: bigint("conversation_id", { mode: "bigint" })
      .notNull()
      .references(() => conversations.id),
    userId: bigint("user_id", { mode: "bigint" })
      .notNull()
      .references(() => users.id),
    joinedAt: timestamp("joined_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.conversationId, table.userId] }),
  })
);
