"use client";

import ThinkingIndicator from "../ui/ThinkingIndicator";

interface ThinkingMessageProps {
  assistantName?: string;
}

export default function ThinkingMessage({ assistantName = "AI Assistant" }: ThinkingMessageProps) {
  return (
    <div className="flex items-start space-x-3 mb-4">
      <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
        AI
      </div>
      <div className="flex-1">
        <div className="flex items-center space-x-2 mb-1">
          <span className="text-sm font-medium text-white">{assistantName}</span>
          <span className="text-xs text-zinc-400">now</span>
        </div>
        <div className="bg-zinc-700 rounded-lg px-4 py-3 max-w-xs">
          <ThinkingIndicator />
        </div>
      </div>
    </div>
  );
}