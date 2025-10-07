import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 3001,
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET,
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  allowedOrigins: process.env.ALLOWED_ORIGINS 
    ? process.env.ALLOWED_ORIGINS.split(',')
    : ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', 'http://localhost:3003'],
  websocketOrigins: process.env.WEBSOCKET_ORIGINS 
    ? process.env.WEBSOCKET_ORIGINS.split(',')
    : ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'],
  geminiApiKey: process.env.GEMINI_API_KEY,
  geminiModel: process.env.GEMINI_MODEL || 'gemini-2.5-flash-lite',
} as const;

const requiredEnvVars = ['DATABASE_URL', 'JWT_SECRET'] as const;

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}