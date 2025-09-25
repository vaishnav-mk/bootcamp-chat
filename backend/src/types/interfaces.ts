export interface User {
  id: bigint;
  email: string;
  passwordHash: string;
  username: string;
  name: string;
  avatarPath?: string;
  status?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Conversation {
  id: bigint;
  type: string;
  name?: string;
  createdBy: bigint;
  createdAt: Date;
}

export interface Message {
  id: bigint;
  conversationId: bigint;
  senderId: bigint;
  parentId?: bigint;
  content?: string;
  messageType: string;
  metadata?: any;
  createdAt: Date;
  updatedAt?: Date;
  threadOrder?: number;
}

export interface ConversationMember {
  id: bigint;
  conversationId: bigint;
  userId: bigint;
  role: string;
  joinedAt: Date;
}