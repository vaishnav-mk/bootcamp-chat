import {
  pgTable,
  bigint,
  text,
  timestamp,
  jsonb,
  integer,
} from "drizzle-orm/pg-core";
import { conversations } from "./conversations";
import { users } from "./users";

export const messages: any = pgTable("messages", {
  id: bigint("id", { mode: "bigint" }).primaryKey(),
  conversationId: bigint("conversation_id", { mode: "bigint" })
    .notNull()
    .references(() => conversations.id),
  senderId: bigint("sender_id", { mode: "bigint" })
    .notNull()
    .references(() => users.id),
  parentId: bigint("parent_id", { mode: "bigint" }).references((): any => messages.id),
  content: text("content"),
  messageType: text("message_type").notNull().default("text"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }),
  threadOrder: integer("thread_order"),
});
