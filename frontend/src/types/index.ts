export interface User {
  id: string;
  email: string;
  username: string;
  name: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Conversation {
  id: string;
  type: "direct" | "group";
  name?: string;
  createdAt: string;
  updatedAt: string;
  members?: User[];
  lastMessage?: Message;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  messageType: "text" | "image" | "file";
  createdAt: string;
  updatedAt: string;
  sender?: User;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
