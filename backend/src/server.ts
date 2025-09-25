import express from "express";
import { createServer } from "http";
import morgan from "morgan";
import cors from "cors";
import dotenv from "dotenv";

import userRoutes from "@/routes/userRoutes";
import authRoutes from "@/routes/authRoutes";
import conversationRoutes from "@/routes/conversationRoutes";
import messageRoutes from "@/routes/messageRoutes";
import { errorHandler } from "@/utils/errorHandler";
import { WebSocketService } from "@/services/websocketService";

dotenv.config();

const app = express();
const httpServer = createServer(app);

const allowedOrigins = [ // im leaving this here for now for mutlipel ports
  'http://localhost:3000',
  'http://localhost:3001', 
  'http://localhost:3002',
  'http://localhost:3003'
];

if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
app.use(express.json());
app.use(morgan("dev"));

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/conversations", conversationRoutes);
app.use("/api/messages", messageRoutes);

app.use(errorHandler);

// Initialize WebSocket service
const wsService = new WebSocketService(httpServer);

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 WebSocket server ready`);
});
