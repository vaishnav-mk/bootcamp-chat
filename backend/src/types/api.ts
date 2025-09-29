export interface CreateMessageData {
  conversation_id: string;
  content: string;
  message_type?: string;
  metadata?: any;
  parent_id?: string;
}

export interface EditMessageData {
  message_id: string;
  content: string;
  metadata?: any;
}

export interface CreateConversationData {
  type: string;
  name?: string;
  member_ids: string[];
}