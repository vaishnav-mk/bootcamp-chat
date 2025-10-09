import { createContext, useContext, useEffect, useState, ReactNode, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useNotifications } from './NotificationContext';

interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  messageType: string;

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
  sender_id?: string;
  content: string;
  message_type?: string;
  metadata?: any;
  parent_id?: string;
}

interface WebSocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  sendMessage: (data: CreateMessageData) => Promise<Message>;
  editMessage: (messageId: string, content: string) => Promise<Message>;
  deleteMessage: (messageId: string) => Promise<{ message_id: string; deleted: boolean }>;
  joinConversations: (conversationIds: string[]) => void;
  onMessageCreated: (callback: (message: Message) => void) => void;
  onMessageEdited: (callback: (message: Message) => void) => void;
  onMessageDeleted: (callback: (data: { message_id: string; deleted: boolean }) => void) => void;
  onConversationCreated: (callback: (conversation: any) => void) => void;
  messages: Message[];
  clearMessages: () => void;
  setActiveConversationId: (id: string | null) => void;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

export const WebSocketProvider: React.FC<{ children: ReactNode; token: string | null }> = ({ children, token }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const conversationCreatedCallbackRef = useRef<((conversation: any) => void) | null>(null);
  const { incrementUnread } = useNotifications();

  useEffect(() => {
    if (!token) return;
    const wsUrl =
  typeof window !== "undefined"
    ? process.env.NEXT_PUBLIC_WS_URL || "http://localhost:3001"
    : process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

    const newSocket = io(wsUrl, { 
      auth: { token },
      transports: ['websocket', 'polling']
    });
    console.log('Attempting to connect to WebSocket server at', wsUrl);

    newSocket.on('connect', () => {
      console.log('WebSocket connected');
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.warn('WebSocket disconnected');
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      setIsConnected(false);
    });

    newSocket.on('message_created', (data: any) => {
      const message = data.message || data;
      
      if (!message || !message.id || !message.content || !message.conversationId) {
        console.error('❌ Invalid message received:', message);
        return;
      }
      
      setMessages(prev => {
        const existingMessage = prev.find(m => m.id === message.id);
        if (existingMessage) return prev;
        
        return [...prev, message];
      });

      if (message.conversationId !== activeConversationId) {
        incrementUnread(message.conversationId, message.senderId);
      }
    });

    newSocket.on('message_edited', (message: Message) => {
      setMessages(prev => prev.map(m => m.id === message.id ? message : m));
    });

    newSocket.on('message_deleted', (data: { message_id: string; deleted: boolean }) => {
      setMessages(prev => prev.filter(m => m.id !== data.message_id));
    });

    newSocket.on('conversation_created', (data: { conversation: any }) => {
      console.log("Received conversation_created event:", data);
      console.log("Callback available:", !!conversationCreatedCallbackRef.current);
      if (conversationCreatedCallbackRef.current) {
        console.log("Calling conversation created callback");
        conversationCreatedCallbackRef.current(data.conversation);
      } else {
        console.log("No callback registered for conversation_created");
      }
      if (data.conversation?.id) {
        newSocket.emit('join_conversations', [data.conversation.id]);
      }
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

  const editMessage = useCallback((messageId: string, content: string): Promise<Message> => {
    return new Promise((resolve, reject) => {
      if (!socket || !isConnected) {
        return reject(new Error('Socket not connected'));
      }

      const data = {
        message_id: String(messageId),
        content: content,
      };
      
      socket.emit('message_edit', data, (response: any) => {
        if (response.success) {
          resolve(response.message);
        } else {
          reject(new Error(response.error));
        }
      });
    });
  }, [socket, isConnected]);

  const deleteMessage = useCallback((messageId: string): Promise<{ message_id: string; deleted: boolean }> => {
    return new Promise((resolve, reject) => {
      if (!socket || !isConnected) {
        return reject(new Error('Socket not connected'));
      }

      const data = {
        message_id: String(messageId),
      };
      
      socket.emit('message_delete', data, (response: any) => {
        if (response.success) {
          resolve(response.result);
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

  const onConversationCreated = useCallback((callback: (conversation: any) => void) => {
    console.log("Setting conversation created callback");
    conversationCreatedCallbackRef.current = callback;
  }, []);

  const value: WebSocketContextType = {
    socket,
    isConnected,
    sendMessage,
    editMessage,
    deleteMessage,
    joinConversations,
    onMessageCreated: () => {},
    onMessageEdited: () => {},
    onMessageDeleted: () => {},
    onConversationCreated,
    messages,
    clearMessages,
    setActiveConversationId
  };

  return <WebSocketContext.Provider value={value}>{children}</WebSocketContext.Provider>;
};

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) throw new Error('useWebSocket must be used within a WebSocketProvider');
  return context;
};