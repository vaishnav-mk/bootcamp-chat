import { pgTable, bigint, text, jsonb, timestamp } from "drizzle-orm/pg-core";
import { messages } from "./messages";

export const media = pgTable("media", {
  id: bigint("id", { mode: "bigint" }).primaryKey(),
  messageId: bigint("message_id", { mode: "bigint" })
    .notNull()
    .references(() => messages.id),
  filePath: text("file_path").notNull(),
  mimeType: text("mime_type"),
  size: bigint("size", { mode: "bigint" }),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});
