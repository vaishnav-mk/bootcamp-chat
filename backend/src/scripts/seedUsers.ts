import { db } from "@/config/db";
import { users } from "../services/db/schemas/users";
import { generateSnowflake } from "@/utils/snowflake";
import bcrypt from 'bcrypt';

const seedUsers = async () => {
  const hashedPassword = await bcrypt.hash('password123', 12);
  
  const sampleUsers = [
    {
      id: generateSnowflake(),
      email: "alice@example.com",
      passwordHash: hashedPassword,
      username: "alice_wonder",
      name: "Alice Wonder",
      avatarPath: "/avatars/112233445566778.png",
      status: "online",
    },
    {
      id: generateSnowflake(),
      email: "bob@example.com",
      passwordHash: hashedPassword,
      username: "bob_builder",
      name: "Bob Builder",
      avatarPath: "/avatars/223344556677889.png",
      status: "offline",
    },
    {
      id: generateSnowflake(),
      email: "charlie@example.com",
      passwordHash: hashedPassword,
      username: "charlie_brown",
      name: "Charlie Brown",
      avatarPath: null,
      status: "away",
    },
  ];

  for (const u of sampleUsers) {
    await db
      .insert(users)
      .values({
        id: u.id,
        email: u.email,
        passwordHash: u.passwordHash,
        username: u.username,
        name: u.name,
        avatarPath: u.avatarPath ?? null,
        status: u.status ?? "offline",
      })
      .onConflictDoNothing()
      .returning();
  }

  console.log("✅ Seeded users table");
};

seedUsers()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => process.exit());
