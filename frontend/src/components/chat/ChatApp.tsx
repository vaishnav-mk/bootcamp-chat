"use client";

import { useCallback, useEffect, useState } from "react";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { useAuth } from "@/context/AuthContext";
import { WebSocketProvider, useWebSocket } from "@/context/WebSocketContext";
import { NotificationProvider, useNotifications } from "@/context/NotificationContext";
import { userApi, conversationApi, messageApi } from "@/lib/api";
import toast from "react-hot-toast";
import { loadConversationsUtil, createConversationUtil, sendMessageUtil } from "@/utils/conversationUtils";
import { mergeWebSocketMessages } from "@/utils/messageUtils";
import type { Conversation, Message } from "@/types";
import ChatArea from "./ChatArea";
import Sidebar from "./sidebar/Sidebar";
import MembersSidebar from "./sidebar/MembersSidebar";

function ChatAppContent() {
  const { user } = useAuth();
  const { sendMessage, isConnected, messages: wsMessages, joinConversations, clearMessages, setActiveConversationId: setWsActiveConversationId, onConversationCreated } = useWebSocket();
  const { markAsRead } = useNotifications();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<
    string | null
  >(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadConversations = useCallback(async () => {
    await loadConversationsUtil(setConversations, setActiveConversationId, joinConversations, activeConversationId);
    setIsLoading(false);
  }, [activeConversationId, joinConversations]);



  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  useEffect(() => {
    setMessages(prev => mergeWebSocketMessages(prev, wsMessages, activeConversationId));
  }, [wsMessages, activeConversationId]);

  useEffect(() => {
    setWsActiveConversationId(activeConversationId);
  }, [activeConversationId, setWsActiveConversationId]);

  useEffect(() => {
    if (activeConversationId) {
      markAsRead(activeConversationId);
    }
  }, [activeConversationId, markAsRead]);

  useEffect(() => {
    onConversationCreated((newConversation) => {
      setConversations(prev => [newConversation, ...prev]);
      toast.success(`Added to new conversation: ${newConversation.name || 'New chat'}`);
    });
  }, [onConversationCreated]);

  // Mark messages as read when window becomes visible and user is viewing a conversation
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && activeConversationId) {
        markAsRead(activeConversationId);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [activeConversationId, markAsRead]);

  useEffect(() => {
    const loadMessages = async () => {
      if (!activeConversationId) {
        setMessages([]);
        return;
      }

      try {
        const data = await messageApi.getConversationMessages(activeConversationId);
        setMessages(data.messages || []);
      } catch {
        toast.error('Failed to load messages');
        setMessages([]);
      }
    };

    loadMessages();
  }, [activeConversationId]);

  const activeConversation = conversations.find(
    (c) => c.id === activeConversationId,
  );
  const conversationMessages = messages.filter(
    (m) => m.conversationId === activeConversationId,
  );

  const handleSendMessage = async (content: string) => {
    await sendMessageUtil(content, activeConversationId, user, isConnected, sendMessage);
  };

  const handleCreateConversation = async (data: {
    type: "direct" | "group";
    name: string;
    member_ids: string[];
  }) => {
    const { conversation } = await conversationApi.createConversation(data);
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

      const { conversation } = await conversationApi.createConversation({
        type: "direct",
        name: "", // Let the backend handle the naming
        member_ids: [userId],
      });
      
      setConversations((prev) => [conversation, ...prev]);
      setActiveConversationId(conversation.id);
    } catch {
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
    <div data-testid="chat-app" className="flex h-screen bg-background">
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

export default function ChatApp() {
  const { isAuthenticated, isLoading } = useAuth();
  const [token, setToken] = useState<string | null>(null);
  useEffect(() => { if (!isLoading) setToken(localStorage.getItem('auth_token')); }, [isLoading]);
  if (isLoading || !token) return <div className="h-screen bg-background flex items-center justify-center"><LoadingSpinner size="lg" /></div>;
  return !isAuthenticated ? <ChatAppContent /> : (
    <NotificationProvider>
      <WebSocketProvider token={token}>
        <ChatAppContent />
      </WebSocketProvider>
    </NotificationProvider>
  );
}
