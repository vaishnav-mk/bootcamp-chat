import type { Message } from "@/types";

export const mergeWebSocketMessages = (
  prevMessages: Message[],
  wsMessages: any[],
  activeConversationId: string | null
): Message[] => {
  const combined = [...prevMessages];
  
  wsMessages.forEach(wsMsg => {
    const existingIndex = combined.findIndex(msg => msg.id === wsMsg.id);
    if (existingIndex === -1 && wsMsg.sender) {
      const processedMessage = {
        ...wsMsg,
        messageType: (wsMsg.messageType as "text" | "image" | "file") || "text",
        updatedAt: wsMsg.updatedAt || wsMsg.createdAt,
        sender: { 
          id: wsMsg.sender.id,
          email: wsMsg.sender.email,
          username: wsMsg.sender.username,
          name: wsMsg.sender.name,
          avatar: wsMsg.sender.avatar,
          createdAt: wsMsg.sender.createdAt || '',
          updatedAt: wsMsg.sender.updatedAt || ''
        }
      };
      combined.push(processedMessage);
    }
  });
  
  return combined.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
};