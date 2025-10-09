import { conversationApi } from "@/lib/api";
import toast from "react-hot-toast";
import type { Conversation } from "@/types";

interface CreateLLMChatOptions {
  name?: string;
  autoStart?: boolean;
}

export const createQuickLLMChat = async (
  options: CreateLLMChatOptions = {},
  setConversations: (fn: (prev: Conversation[]) => Conversation[]) => void,
  setActiveConversationId: (id: string) => void,
  existingConversations?: Conversation[]
): Promise<Conversation | null> => {
  try {
    if (existingConversations) {
      const existingLLMChat = existingConversations.find(conv => conv.type === 'llm');
      if (existingLLMChat) {
        toast.error("You already have an AI chat. Only one AI chat is allowed.");
        setActiveConversationId(existingLLMChat.id);
        return existingLLMChat;
      }
    }
    
    const chatName = options.name || "AI Assistant";
    
    const { conversation } = await conversationApi.createConversation({
      type: "llm",
      name: chatName,
      member_ids: [],
    });

    setConversations(prev => [conversation, ...prev]);
    
    if (options.autoStart !== false) {
      setActiveConversationId(conversation.id);
    }
    
    toast.success(`${chatName} created successfully!`);
    return conversation;
  } catch (error) {
    console.error("Failed to create LLM chat:", error);
    toast.error("Failed to create AI chat");
    return null;
  }
};