export enum ConversationType {
  DIRECT = "direct",
  GROUP = "group",
}

export enum MessageType {
  TEXT = "text",
  IMAGE = "image",
  FILE = "file",
  SYSTEM = "system",
}

export enum UserStatus {
  ONLINE = "online",
  OFFLINE = "offline",
  AWAY = "away",
  BUSY = "busy",
}

export enum MemberRole {
  OWNER = "owner",
  ADMIN = "admin",
  MEMBER = "member",
}

export enum WebSocketEvent {
  CONNECTION = 'connection',
  DISCONNECT = 'disconnect',
  JOIN_CONVERSATIONS = 'join_conversations',
  MESSAGE_CREATE = 'message_create',
  MESSAGE_EDIT = 'message_edit',
  MESSAGE_DELETE = 'message_delete',
  MESSAGE_CREATED = 'message_created',
  MESSAGE_EDITED = 'message_edited',
  MESSAGE_DELETED = 'message_deleted',
  CONVERSATION_CREATED = 'conversation_created',
}