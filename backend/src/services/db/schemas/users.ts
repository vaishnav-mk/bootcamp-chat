import { pgTable, bigint, text, timestamp } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: bigint("id", { mode: "bigint" }).primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  username: text("username").notNull().unique(),
  name: text("name").notNull(),
  avatarPath: text("avatar_path"),
  status: text("status").default("offline"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});
