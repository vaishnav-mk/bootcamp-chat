"use client";

import { createQuickLLMChat } from "@/utils/llmChatUtils";
import type { Conversation } from "@/types";

interface FloatingLLMButtonProps {
  setConversations: (fn: (prev: Conversation[]) => Conversation[]) => void;
  setActiveConversationId: (id: string) => void;
  conversations: Conversation[];
}

export default function FloatingLLMButton({
  setConversations,
  setActiveConversationId,
  conversations,
}: FloatingLLMButtonProps) {
  const handleQuickCreate = async () => {
    await createQuickLLMChat(
      { name: "AI Assistant" },
      setConversations,
      setActiveConversationId,
      conversations
    );
  };

  return (
    <div className="absolute bottom-6 right-6">
      <button
        onClick={handleQuickCreate}
        className="flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
        title="Start AI Chat"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
        <span className="font-medium">Ask AI</span>
      </button>
    </div>
  );
}