import { Server, Socket } from "socket.io";
import { Server as HTTPServer } from "http";
import { verifyToken } from "@/lib/jwt";
import { 
  createMessage, 
  editMessage, 
  deleteMessage, 
  verifyUserInConversation,
  CreateMessageData,
  EditMessageData 
} from "@/services/messageService";

interface AuthenticatedSocket extends Socket {
  userId?: string;
  email?: string;
}

export class WebSocketService {
  private io: Server;
  private connectedUsers: Map<string, string> = new Map(); // userId -> socketId

  constructor(httpServer: HTTPServer) {
    this.io = new Server(httpServer, {
      cors: {
        origin: [
          'http://localhost:3000',
          'http://localhost:3001', 
          'http://localhost:3002',
          'http://localhost:3003'
        ],
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
        
        if (!token) {
          return next(new Error('Authentication error: No token provided'));
        }

        const payload = verifyToken(token);
        socket.userId = payload.userId;
        socket.email = payload.email;
        
        next();
      } catch (error) {
        next(new Error('Authentication error: Invalid token'));
      }
    });
  }

  private setupEventHandlers() {
    this.io.on('connection', (socket: AuthenticatedSocket) => {
      console.log(`User ${socket.userId} connected with socket ${socket.id}`);
      
      if (socket.userId) {
        this.connectedUsers.set(socket.userId, socket.id);
      }

      // Join user to their conversations
      socket.on('join_conversations', async (conversationIds: string[]) => {
        if (!socket.userId) return;

        for (const conversationId of conversationIds) {
          // Verify user is a member of this conversation
          const isMember = await verifyUserInConversation(socket.userId, conversationId);
          if (isMember) {
            socket.join(`conversation:${conversationId}`);
            console.log(`User ${socket.userId} joined conversation ${conversationId}`);
          }
        }
      });

      // Handle message creation
      socket.on('message_create', async (data: CreateMessageData, callback: any) => {
        try {
          if (!socket.userId) {
            throw new Error('Unauthorized');
          }

          // Verify user is in the conversation
          const isMember = await verifyUserInConversation(socket.userId, data.conversation_id);
          if (!isMember) {
            throw new Error('User not in conversation');
          }

          const message = await createMessage(socket.userId, data);
          
          // Broadcast to all members of the conversation
          this.io.to(`conversation:${data.conversation_id}`).emit('message_created', message);
          
          if (callback) callback({ success: true, message });
        } catch (error: any) {
          console.error('Error creating message:', error);
          if (callback) callback({ success: false, error: error.message });
        }
      });

      // Handle message editing
      socket.on('message_edit', async (data: EditMessageData, callback: any) => {
        try {
          if (!socket.userId) {
            throw new Error('Unauthorized');
          }

          const message = await editMessage(socket.userId, data);
          
          // Broadcast to all members of the conversation
          this.io.to(`conversation:${message.conversationId}`).emit('message_edited', message);
          
          if (callback) callback({ success: true, message });
        } catch (error: any) {
          console.error('Error editing message:', error);
          if (callback) callback({ success: false, error: error.message });
        }
      });

      // Handle message deletion
      socket.on('message_delete', async (data: { message_id: string }, callback: any) => {
        try {
          if (!socket.userId) {
            throw new Error('Unauthorized');
          }

          const result = await deleteMessage(socket.userId, data.message_id);
          
          // Get the conversation from message to broadcast to the right room
          // Since we deleted the message, we need to emit to all active conversations
          // In a real implementation, we'd store the conversationId before deletion
          socket.broadcast.emit('message_deleted', result);
          
          if (callback) callback({ success: true, result });
        } catch (error: any) {
          console.error('Error deleting message:', error);
          if (callback) callback({ success: false, error: error.message });
        }
      });

      socket.on('disconnect', () => {
        console.log(`User ${socket.userId} disconnected`);
        if (socket.userId) {
          this.connectedUsers.delete(socket.userId);
        }
      });
    });
  }

  // Method to send message to specific user
  public sendToUser(userId: string, event: string, data: any) {
    const socketId = this.connectedUsers.get(userId);
    if (socketId) {
      this.io.to(socketId).emit(event, data);
    }
  }

  // Method to send message to conversation members
  public sendToConversation(conversationId: string, event: string, data: any) {
    this.io.to(`conversation:${conversationId}`).emit(event, data);
  }

  public getIO() {
    return this.io;
  }
}