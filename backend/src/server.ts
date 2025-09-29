import express from "express";
import { createServer } from "http";
import morgan from "morgan";
import cors from "cors";

import { config } from "@/config/env";
import userRoutes from "@/routes/userRoutes";
import authRoutes from "@/routes/authRoutes";
import conversationRoutes from "@/routes/conversationRoutes";
import messageRoutes from "@/routes/messageRoutes";
import { errorHandler } from "@/utils/errorHandler";
import { WebSocketService } from "@/services/websocketService";
import { setWebSocketService } from "@/services/wsServiceInstance";

const app = express();
const httpServer = createServer(app);

app.use(cors({
  origin: config.allowedOrigins,
  credentials: true
}));
app.use(express.json());
app.use(morgan("dev"));

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/conversations", conversationRoutes);
app.use("/api/messages", messageRoutes);

app.use(errorHandler);

const wsService = new WebSocketService(httpServer);
setWebSocketService(wsService);

httpServer.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
  console.log(`WebSocket server ready at ws://localhost:${config.port}`);
  console.log(`Environment: ${config.nodeEnv}`);
});
