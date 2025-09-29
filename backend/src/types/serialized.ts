export interface SerializedUser {
  id: string;
  email: string;
  username: string;
  name: string;
  avatar?: string | null;
  status?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface SerializedConversation {
  id: string;
  type: string;
  name?: string;
  createdBy: string;
  createdAt: Date;
  members: SerializedUser[];
}

export interface SerializedMessage {
  id: string;
  conversationId: string;
  senderId: string;
  parentId?: string;
  content?: string;
  messageType: string;
  metadata?: any;
  createdAt: Date;
  updatedAt?: Date;
  threadOrder?: number;
  sender?: SerializedUser;
}