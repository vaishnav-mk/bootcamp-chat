import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';

interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  messageType: string;
  createdAt: string;
  sender: {
    id: string;
    username: string;
    name: string;
  };
}

interface CreateMessageData {
  conversation_id: string;
  content: string;
  message_type?: string;
}

interface WebSocketContextType {
  isConnected: boolean;
  sendMessage: (data: CreateMessageData) => Promise<any>;
  joinConversations: (conversationIds: string[]) => void;
  onMessageCreated: (callback: (message: Message) => void) => void;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

export const WebSocketProvider: React.FC<{ children: ReactNode; token: string | null }> = ({ children, token }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!token) return;

    const newSocket = io('http://localhost:3001', { auth: { token } });

    newSocket.on('connect', () => setIsConnected(true));
    newSocket.on('disconnect', () => setIsConnected(false));
    newSocket.on('connect_error', (error) => console.error('WebSocket error:', error));

    setSocket(newSocket);
    return () => {
      newSocket.disconnect();
    };
  }, [token]);

  const sendMessage = (data: CreateMessageData): Promise<any> => {
    return new Promise((resolve, reject) => {
      if (!socket) return reject(new Error('Socket not connected'));
      socket.emit('message_create', data, (response: any) => {
        response.success ? resolve(response.message) : reject(new Error(response.error));
      });
    });
  };

  const joinConversations = (conversationIds: string[]) => {
    if (socket) socket.emit('join_conversations', conversationIds);
  };

  const onMessageCreated = (callback: (message: Message) => void) => {
    if (socket) socket.on('message_created', callback);
  };

  const value: WebSocketContextType = {
    isConnected,
    sendMessage,
    joinConversations,
    onMessageCreated
  };

  return <WebSocketContext.Provider value={value}>{children}</WebSocketContext.Provider>;
};

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) throw new Error('useWebSocket must be used within a WebSocketProvider');
  return context;
};