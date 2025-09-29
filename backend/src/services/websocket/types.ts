import { Socket } from "socket.io";

export interface AuthenticatedSocket extends Socket {
  userId?: string;
  email?: string;
}

export interface WebSocketHandler {
  name: string;
  handler: (params: any) => Promise<void>;
}