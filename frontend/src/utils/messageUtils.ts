import type { Message } from "@/types";

export const mergeWebSocketMessages = (
  prevMessages: Message[],
  wsMessages: any[],
  activeConversationId: string | null
): Message[] => {
  if (!activeConversationId) return prevMessages;
  
  const conversationMessages = wsMessages.filter(msg => msg.conversationId === activeConversationId);
  const combined = [...prevMessages];
  
  conversationMessages.forEach(wsMsg => {
    if (!combined.find(msg => msg.id === wsMsg.id) && wsMsg.sender) {
      combined.push({
        ...wsMsg,
        messageType: (wsMsg.messageType as "text" | "image" | "file") || "text",
        updatedAt: wsMsg.updatedAt || wsMsg.createdAt,
        sender: { 
          id: wsMsg.sender.id,
          email: wsMsg.sender.email,
          username: wsMsg.sender.username,
          name: wsMsg.sender.name,
          avatar: undefined,
          createdAt: '',
          updatedAt: ''
        }
      });
    }
  });
  
  return combined.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
};