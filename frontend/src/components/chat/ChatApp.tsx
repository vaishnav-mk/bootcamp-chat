"use client";

import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { useAuth } from "@/context/AuthContext";
import { conversationApi, userApi } from "@/lib/api";
import type { Conversation, Message } from "@/types";
import ChatArea from "./ChatArea";
import MembersSidebar from "./MembersSidebar";
import Sidebar from "./Sidebar";

export default function ChatApp() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<
    string | null
  >(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadConversations = useCallback(async () => {
    try {
      const { conversations } = await conversationApi.getConversations();
      setConversations(conversations);
      if (conversations.length > 0 && !activeConversationId) {
        setActiveConversationId(conversations[0].id);
      }
    } catch (_error) {
      toast.error("Failed to load conversations");
    } finally {
      setIsLoading(false);
    }
  }, [activeConversationId]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  const activeConversation = conversations.find(
    (c) => c.id === activeConversationId,
  );
  const conversationMessages = messages.filter(
    (m) => m.conversationId === activeConversationId,
  );

  const handleSendMessage = (content: string) => {
    if (!activeConversationId || !content.trim() || !user) {
      toast.error("Cannot send empty message");
      return;
    }

    const newMessage: Message = {
      id: Date.now().toString(),
      conversationId: activeConversationId,
      senderId: user.id,
      content: content.trim(),
      messageType: "text",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      sender: user,
    };

    setMessages((prev) => [...prev, newMessage]);
  };

  const handleCreateConversation = async (data: {
    type: "direct" | "group";
    name: string;
    member_ids: string[];
  }) => {
    let conversationData = { ...data };
    
    if (data.type === "direct" && data.member_ids.length === 1) {
      const { user: targetUser } = await userApi.getUserById(data.member_ids[0]);
      conversationData.name = targetUser.name;
    }
    
    const { conversation } = await conversationApi.createConversation(conversationData);
    setConversations((prev) => [conversation, ...prev]);
    setActiveConversationId(conversation.id);
  };

  const handleReorderConversations = (
    reorderedConversations: Conversation[],
  ) => {
    setConversations(reorderedConversations);
  };

  const handleStartDirectMessage = async (userId: string) => {
    try {
      const existingDM = conversations.find(
        (conv) => 
          conv.type === "direct" && 
          conv.members?.some(member => member.id === userId)
      );
      
      if (existingDM) {
        setActiveConversationId(existingDM.id);
        return;
      }

      const { user: targetUser } = await userApi.getUserById(userId);
      
      const { conversation } = await conversationApi.createConversation({
        type: "direct",
        name: targetUser.name,
        member_ids: [userId],
      });
      
      setConversations((prev) => [conversation, ...prev]);
      setActiveConversationId(conversation.id);
    } catch (_error) {
      toast.error("failed to start direct message");
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen bg-background flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar
        conversations={conversations}
        activeConversationId={activeConversationId}
        onConversationSelect={setActiveConversationId}
        onCreateConversation={handleCreateConversation}
        onReorderConversations={handleReorderConversations}
      />
      <ChatArea
        conversation={activeConversation}
        messages={conversationMessages}
        onSendMessage={handleSendMessage}
      />
      {user && (
        <MembersSidebar
          conversation={activeConversation}
          currentUserId={user.id}
          onStartDirectMessage={handleStartDirectMessage}
        />
      )}
    </div>
  );
}
