import { conversationApi } from "@/lib/api";
import toast from "react-hot-toast";
import type { Conversation } from "@/types";

export const loadConversationsUtil = async (
  setConversations: (conversations: Conversation[]) => void,
  setActiveConversationId: (id: string | null) => void,
  joinConversations: (ids: string[]) => void,
  activeConversationId: string | null
) => {
  try {
    const { conversations } = await conversationApi.getConversations();
    setConversations(conversations);
    if (conversations.length > 0 && !activeConversationId) {
      setActiveConversationId(conversations[0].id);
    }
    const conversationIds = conversations.map(c => c.id);
    if (conversationIds.length > 0) {
      joinConversations(conversationIds);
    }
    return conversations;
  } catch {
    toast.error("Failed to load conversations");
    return [];
  }
};

export const createConversationUtil = async (
  data: { type: "direct" | "group"; name: string; member_ids: string[] },
  setConversations: (fn: (prev: Conversation[]) => Conversation[]) => void,
  setActiveConversationId: (id: string) => void
) => {
  try {
    const { conversation } = await conversationApi.createConversation(data);
    setConversations(prev => [conversation, ...prev]);
    setActiveConversationId(conversation.id);
    toast.success("Conversation created successfully");
  } catch {
    toast.error("Failed to create conversation");
  }
};

export const sendMessageUtil = async (
  content: string,
  activeConversationId: string | null,
  user: any,
  isConnected: boolean,
  sendMessage: (data: any) => Promise<any>
) => {
  if (!activeConversationId || !content.trim() || !user || !isConnected) {
    toast.error(isConnected ? "Cannot send empty message" : "Not connected to server");
    return;
  }
  try {
    await sendMessage({
      conversation_id: activeConversationId,
      content: content.trim(),
      message_type: "text"
    });
  } catch (error: any) {
    toast.error(error.message || "Failed to send message");
  }
};