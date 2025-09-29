import { Socket } from "socket.io";

export interface AuthenticatedSocket extends Socket {
  userId?: string;
  email?: string;
}

export interface WebSocketHandler {
  name: string;
  handler: (context: WebSocketContext) => Promise<void>;
}

export interface WebSocketContext {
  socket: AuthenticatedSocket;
  data: any;
  callback?: any;
  io: any;
}