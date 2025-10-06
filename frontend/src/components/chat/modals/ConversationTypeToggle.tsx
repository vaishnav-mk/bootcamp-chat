"use client";

import type { Conversation } from "@/types";

interface ConversationTypeToggleProps {
  conversationType: "direct" | "group" | "llm";
  onChange: (type: "direct" | "group" | "llm") => void;
  conversations?: Conversation[];
}

export default function ConversationTypeToggle({
  conversationType,
  onChange,
  conversations,
}: ConversationTypeToggleProps) {
  const hasExistingLLMChat = conversations?.some(conv => conv.type === 'llm');

  const handleLLMClick = () => {
    if (hasExistingLLMChat) {
      const existingLLMChat = conversations?.find(conv => conv.type === 'llm');
      if (existingLLMChat) {
        return;
      }
    }
    onChange("llm");
  };
  return (
    <div className="grid grid-cols-3 bg-zinc-700 p-1 rounded gap-1">
      <button
        type="button"
        onClick={() => onChange("direct")}
        className={`py-2 px-3 text-sm font-medium transition-colors rounded ${
          conversationType === "direct"
            ? "bg-blue-600 text-white"
            : "text-zinc-300 hover:text-white hover:bg-zinc-600"
        }`}
      >
        direct
      </button>
      <button
        type="button"
        onClick={() => onChange("group")}
        className={`py-2 px-3 text-sm font-medium transition-colors rounded ${
          conversationType === "group"
            ? "bg-green-600 text-white"
            : "text-zinc-300 hover:text-white hover:bg-zinc-600"
        }`}
      >
        group
      </button>
      <button
        type="button"
        onClick={handleLLMClick}
        disabled={hasExistingLLMChat}
        className={`py-2 px-3 text-sm font-medium transition-colors rounded relative ${
          conversationType === "llm"
            ? "bg-purple-600 text-white"
            : hasExistingLLMChat
            ? "text-zinc-500 bg-zinc-600 cursor-not-allowed"
            : "text-zinc-300 hover:text-white hover:bg-zinc-600"
        }`}
        title={hasExistingLLMChat ? "AI chat already exists" : "Create AI chat"}
      >
        ai chat
        {hasExistingLLMChat && (
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-500 rounded-full text-xs flex items-center justify-center text-black font-bold">
            1
          </span>
        )}
      </button>
    </div>
  );
}