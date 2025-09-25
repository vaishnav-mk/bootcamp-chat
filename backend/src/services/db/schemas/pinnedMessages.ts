import { pgTable, bigint, timestamp } from "drizzle-orm/pg-core";
import { conversations } from "./conversations";
import { messages } from "./messages";
import { users } from "./users";

export const pinnedMessages = pgTable("pinned_messages", {
  id: bigint("id", { mode: "bigint" }).primaryKey(),
  conversationId: bigint("conversation_id", { mode: "bigint" })
    .notNull()
    .references(() => conversations.id),
  messageId: bigint("message_id", { mode: "bigint" })
    .notNull()
    .references(() => messages.id),
  pinnedBy: bigint("pinned_by", { mode: "bigint" })
    .notNull()
    .references(() => users.id),
  pinnedAt: timestamp("pinned_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});
