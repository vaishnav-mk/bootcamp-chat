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
  const { sendMessage, isConnected, messages: wsMessages, joinConversations, clearMessages, setActiveConversationId: setWsActiveConversationId, onConversationCreated, streamingMessages } = useWebSocket();
  const { markAsRead } = useNotifications();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<
    string | null
  >(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isThinking, setIsThinking] = useState(false);
  const [lastUserMessageTime, setLastUserMessageTime] = useState<number | null>(null);

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
    setIsThinking(false);
    setLastUserMessageTime(null);
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

  const streamingContent = activeConversationId ? streamingMessages.get(activeConversationId) : null;

  useEffect(() => {
    console.log('�️ StreamingMessages Map state:', {
      mapSize: streamingMessages.size,
      mapEntries: Array.from(streamingMessages.entries()),
      activeConversationId,
      streamingContent
    });
  }, [streamingMessages, activeConversationId, streamingContent]);

  useEffect(() => {
    console.log('�🔄 Streaming content changed:', { 
      activeConversationId, 
      hasContent: !!streamingContent, 
      contentLength: streamingContent?.length,
      content: streamingContent 
    });
  }, [streamingContent, activeConversationId]);

  useEffect(() => {
    if (streamingContent) {
      console.log('💭 Streaming started, disabling thinking indicator');
      setIsThinking(false);
    }
  }, [streamingContent]);

  useEffect(() => {
    if (!isThinking || !lastUserMessageTime) return;
    
    const lastMessage = conversationMessages[conversationMessages.length - 1];
    
    if (lastMessage?.metadata?.isLLMResponse) {
      const messageTime = new Date(lastMessage.createdAt).getTime();
      if (messageTime > lastUserMessageTime) {
        console.log("Setting isThinking to false - received new LLM response after user message");
        setIsThinking(false);
        setLastUserMessageTime(null);
      }
    }
  }, [conversationMessages.length, isThinking, lastUserMessageTime]);

  useEffect(() => {
    if (!isThinking) return;
    
    const timeout = setTimeout(() => {
      setIsThinking(false);
      setLastUserMessageTime(null);
      console.log("Setting isThinking to false due to timeout after 30 seconds");
    }, 30000);
    
    return () => clearTimeout(timeout);
  }, [isThinking]);

  const handleSendMessage = async (content: string) => {
    const activeConversation = conversations.find(c => c.id === activeConversationId);
    
    if (activeConversation?.type === "llm") {
      console.log("Setting isThinking to true for LLM conversation");
      setIsThinking(true);
      setLastUserMessageTime(Date.now());
    }
    
    try {
      await sendMessageUtil(content, activeConversationId, user, isConnected, sendMessage);
    } catch (error) {
      setIsThinking(false);
      setLastUserMessageTime(null);
      console.log("Setting isThinking to false due to error in sending message");
      throw error;
    }
  };

  const handleCreateConversation = async (data: {
    type: "direct" | "group" | "llm";
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
        name: "",
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
        setConversations={setConversations}
        setActiveConversationId={setActiveConversationId}
      />
      <ChatArea
        conversation={activeConversation || null}
        messages={conversationMessages}
        onSendMessage={handleSendMessage}
        isConnected={isConnected}
        isThinking={isThinking}
        setConversations={setConversations}
        setActiveConversationId={setActiveConversationId}
        conversations={conversations}
        streamingContent={streamingContent}
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
