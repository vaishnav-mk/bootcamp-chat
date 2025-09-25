import { pgTable, bigint, timestamp, primaryKey } from "drizzle-orm/pg-core";
import { conversations } from "./conversations";
import { messages } from "./messages";
import { users } from "./users";

export const starredMessages = pgTable(
  "starred_messages",
  {
    userId: bigint("user_id", { mode: "bigint" })
      .notNull()
      .references(() => users.id),
    messageId: bigint("message_id", { mode: "bigint" })
      .notNull()
      .references(() => messages.id),
    conversationId: bigint("conversation_id", { mode: "bigint" })
      .notNull()
      .references(() => conversations.id),
    starredAt: timestamp("starred_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.userId, table.messageId] }),
  })
);
