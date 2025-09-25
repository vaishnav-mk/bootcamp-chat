import type { Config } from "drizzle-kit";
import * as dotenv from "dotenv";

dotenv.config();

const config: Config = {
  schema: "./src/services/db/schemas/index.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
};

export default config;
