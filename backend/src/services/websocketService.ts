import { Server } from "socket.io";
import { Server as HTTPServer } from "http";
import { config } from "@/config/env";
import { verifyToken } from "@/lib/jwt";
import { ErrorMessage } from "@/constants/errors";
import { WebSocketEvent } from "@/constants/enums";
import { AuthenticatedSocket } from "@/types";
import handlers from "./websocket/handlers";

export class WebSocketService {
  private io: Server;
  private connectedUsers: Map<string, string> = new Map();

  constructor(httpServer: HTTPServer) {
    this.io = new Server(httpServer, {
      cors: {
        origin: config.websocketOrigins,
        credentials: true
      }
    });
    this.setupMiddleware();
    this.setupEventHandlers();
  }

  private setupMiddleware() {
    this.io.use(async (socket: AuthenticatedSocket, next) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.query.token;
        if (!token) return next(new Error(ErrorMessage.TOKEN_REQUIRED));
        
        const payload = verifyToken(token);
        socket.userId = payload.userId;
        socket.email = payload.email;
        next();
      } catch (error) {
        next(new Error(ErrorMessage.INVALID_OR_EXPIRED_TOKEN));
      }
    });
  }

  private setupEventHandlers() {
    this.io.on(WebSocketEvent.CONNECTION, (socket: AuthenticatedSocket) => {
      if (socket.userId) {
        this.connectedUsers.set(socket.userId, socket.id);
      }

      // Register all handlers
      handlers.forEach(handler => {
        socket.on(handler.name, async (data: any, callback?: any) => {
          await handler.handler({ socket, data, callback, io: this.io });
        });
      });

      socket.on(WebSocketEvent.DISCONNECT, () => {
        if (socket.userId) this.connectedUsers.delete(socket.userId);
      });
    });
  }

  public sendToConversation(conversationId: string, event: string, data: any) {
    this.io.to(`conversation:${conversationId}`).emit(event, data);
  }

  public sendToUsers(userIds: string[], event: string, data: any) {
    console.log(`Attempting to send ${event} to users:`, userIds);
    console.log("Currently connected users:", Array.from(this.connectedUsers.keys()));
    
    userIds.forEach(userId => {
      const socketId = this.connectedUsers.get(userId);
      console.log(`User ${userId} socketId:`, socketId);
      if (socketId) {
        this.io.to(socketId).emit(event, data);
        console.log(`Sent ${event} to user ${userId} (socket ${socketId})`);
      } else {
        console.log(`User ${userId} is not connected`);
      }
    });
  }

  public joinUserToConversation(userId: string, conversationId: string) {
    const socketId = this.connectedUsers.get(userId);
    if (socketId) {
      const socket = this.io.sockets.sockets.get(socketId);
      if (socket) {
        socket.join(`conversation:${conversationId}`);
      }
    }
  }
}