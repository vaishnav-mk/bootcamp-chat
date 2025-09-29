import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  messageType: string;
  createdAt: string;
  updatedAt?: string;
  sender: {
    id: string;
    username: string;
    name: string;
    email: string;
  };
}

interface CreateMessageData {
  conversation_id: string;
  content: string;
  message_type?: string;
  metadata?: any;
  parent_id?: string;
}

interface WebSocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  sendMessage: (data: CreateMessageData) => Promise<Message>;
  joinConversations: (conversationIds: string[]) => void;
  onMessageCreated: (callback: (message: Message) => void) => void;
  onMessageEdited: (callback: (message: Message) => void) => void;
  onMessageDeleted: (callback: (data: { message_id: string; deleted: boolean }) => void) => void;
  messages: Message[];
  clearMessages: () => void;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

export const WebSocketProvider: React.FC<{ children: ReactNode; token: string | null }> = ({ children, token }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    if (!token) return;
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3001';
    const newSocket = io(wsUrl, { 
      auth: { token },
      transports: ['websocket', 'polling']
    });

    newSocket.on('connect', () => {
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      setIsConnected(false);
    });

    newSocket.on('message_created', (message: Message) => {
      setMessages(prev => {
        if (prev.find(m => m.id === message.id)) return prev;
        return [...prev, message];
      });
    });

    newSocket.on('message_edited', (message: Message) => {
      setMessages(prev => prev.map(m => m.id === message.id ? message : m));
    });

    newSocket.on('message_deleted', (data: { message_id: string; deleted: boolean }) => {
      setMessages(prev => prev.filter(m => m.id !== data.message_id));
    });

    setSocket(newSocket);
    return () => {
      newSocket.disconnect();
    };
  }, [token]);

  const sendMessage = useCallback((data: CreateMessageData): Promise<Message> => {
    return new Promise((resolve, reject) => {
      if (!socket || !isConnected) {
        return reject(new Error('Socket not connected'));
      }

      const serializedData = {
        ...data,
        conversation_id: String(data.conversation_id),
        parent_id: data.parent_id ? String(data.parent_id) : undefined,
      };
      
      socket.emit('message_create', serializedData, (response: any) => {
        if (response.success) {
          resolve(response.message);
        } else {
          reject(new Error(response.error));
        }
      });
    });
  }, [socket, isConnected]);

  const joinConversations = useCallback((conversationIds: string[]) => {
    if (socket && isConnected) {
      const serializedIds = conversationIds.map(id => String(id));
      socket.emit('join_conversations', serializedIds);
    }
  }, [socket, isConnected]);

  const clearMessages = useCallback(() => setMessages([]), []);

  const value: WebSocketContextType = {
    socket,
    isConnected,
    sendMessage,
    joinConversations,
    onMessageCreated: () => {},
    onMessageEdited: () => {},
    onMessageDeleted: () => {},
    messages,
    clearMessages
  };

  return <WebSocketContext.Provider value={value}>{children}</WebSocketContext.Provider>;
};

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) throw new Error('useWebSocket must be used within a WebSocketProvider');
  return context;
};