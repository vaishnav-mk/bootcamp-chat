import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';

interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  parentId?: string;
  content: string;
  messageType: string;
  metadata?: any;
  createdAt: string;
  updatedAt?: string;
  threadOrder?: number;
  sender: {
    id: string;
    username: string;
    name: string;
    email: string;
    avatar?: string;
  };
}

interface CreateMessageData {
  conversation_id: string;
  content: string;
  message_type?: string;
  metadata?: any;
  parent_id?: string;
}

interface EditMessageData {
  message_id: string;
  content: string;
  metadata?: any;
}

interface WebSocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  sendMessage: (data: CreateMessageData) => Promise<any>;
  editMessage: (data: EditMessageData) => Promise<any>;
  deleteMessage: (messageId: string) => Promise<any>;
  joinConversations: (conversationIds: string[]) => void;
  messages: Message[];
  onMessageCreated: (callback: (message: Message) => void) => void;
  onMessageEdited: (callback: (message: Message) => void) => void;
  onMessageDeleted: (callback: (data: { message_id: string; deleted: boolean }) => void) => void;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

interface WebSocketProviderProps {
  children: ReactNode;
  token: string | null;
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({ children, token }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    if (!token) return;

    const newSocket = io('http://localhost:3001', {
      auth: {
        token
      }
    });

    newSocket.on('connect', () => {
      setIsConnected(true);
      console.log('Connected to WebSocket server');
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
      console.log('Disconnected from WebSocket server');
    });

    newSocket.on('message_created', (message: Message) => {
      setMessages(prev => [...prev, message]);
    });

    newSocket.on('message_edited', (message: Message) => {
      setMessages(prev => prev.map(msg => 
        msg.id === message.id ? message : msg
      ));
    });

    newSocket.on('message_deleted', (data: { message_id: string; deleted: boolean }) => {
      setMessages(prev => prev.filter(msg => msg.id !== data.message_id));
    });

    newSocket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [token]);

  const sendMessage = (data: CreateMessageData): Promise<any> => {
    return new Promise((resolve, reject) => {
      if (!socket) {
        reject(new Error('Socket not connected'));
        return;
      }

      socket.emit('message_create', data, (response: any) => {
        if (response.success) {
          resolve(response.message);
        } else {
          reject(new Error(response.error));
        }
      });
    });
  };

  const editMessage = (data: EditMessageData): Promise<any> => {
    return new Promise((resolve, reject) => {
      if (!socket) {
        reject(new Error('Socket not connected'));
        return;
      }

      socket.emit('message_edit', data, (response: any) => {
        if (response.success) {
          resolve(response.message);
        } else {
          reject(new Error(response.error));
        }
      });
    });
  };

  const deleteMessage = (messageId: string): Promise<any> => {
    return new Promise((resolve, reject) => {
      if (!socket) {
        reject(new Error('Socket not connected'));
        return;
      }

      socket.emit('message_delete', { message_id: messageId }, (response: any) => {
        if (response.success) {
          resolve(response.result);
        } else {
          reject(new Error(response.error));
        }
      });
    });
  };

  const joinConversations = (conversationIds: string[]) => {
    if (socket) {
      socket.emit('join_conversations', conversationIds);
    }
  };

  const onMessageCreated = (callback: (message: Message) => void) => {
    if (socket) {
      socket.on('message_created', callback);
    }
  };

  const onMessageEdited = (callback: (message: Message) => void) => {
    if (socket) {
      socket.on('message_edited', callback);
    }
  };

  const onMessageDeleted = (callback: (data: { message_id: string; deleted: boolean }) => void) => {
    if (socket) {
      socket.on('message_deleted', callback);
    }
  };

  const value: WebSocketContextType = {
    socket,
    isConnected,
    sendMessage,
    editMessage,
    deleteMessage,
    joinConversations,
    messages,
    onMessageCreated,
    onMessageEdited,
    onMessageDeleted
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};