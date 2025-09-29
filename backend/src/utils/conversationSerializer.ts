import { SerializedUser, SerializedConversation } from "@/types";

export const serializeConversation = (conversation: any, members: SerializedUser[]): SerializedConversation => {
  return {
    id: conversation.id.toString(),
    type: conversation.type,
    name: conversation.name,
    createdBy: conversation.createdBy.toString(),
    createdAt: conversation.createdAt,
    members,
  };
};