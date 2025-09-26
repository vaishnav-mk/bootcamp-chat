export const WebSocketEvents = {
  CONNECTION: 'connection',
  DISCONNECT: 'disconnect',
  JOIN_CONVERSATIONS: 'join_conversations',
  MESSAGE_CREATE: 'message_create',
  MESSAGE_EDIT: 'message_edit',
  MESSAGE_DELETE: 'message_delete',
  MESSAGE_CREATED: 'message_created',
  MESSAGE_EDITED: 'message_edited',
  MESSAGE_DELETED: 'message_deleted',
} as const;

export type WebSocketEvent = typeof WebSocketEvents[keyof typeof WebSocketEvents];