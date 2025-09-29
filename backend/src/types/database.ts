import { ConversationType, MessageType, UserStatus, MemberRole } from "../constants/enums";

export interface User {
  id: bigint;
  email: string;
  passwordHash: string;
  username: string;
  name: string;
  avatarPath?: string;
  status?: UserStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface Conversation {
  id: bigint;
  type: ConversationType;
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
  messageType: MessageType;
  metadata?: any;
  createdAt: Date;
  updatedAt?: Date;
  threadOrder?: number;
}

export interface ConversationMember {
  id: bigint;
  conversationId: bigint;
  userId: bigint;
  role: MemberRole;
  joinedAt: Date;
}