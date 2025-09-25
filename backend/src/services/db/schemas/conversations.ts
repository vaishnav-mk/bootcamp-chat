import { pgTable, bigint, text, timestamp } from "drizzle-orm/pg-core";
import { users } from "./users";

export const conversations = pgTable("conversations", {
  id: bigint("id", { mode: "bigint" }).primaryKey(),
  type: text("type").notNull(), // direct / group
  name: text("name"),
  createdBy: bigint("created_by", { mode: "bigint" })
    .notNull()
    .references(() => users.id),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});
