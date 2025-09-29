"use client";

import { useNotifications } from "@/context/NotificationContext";
import type { Conversation } from "@/types";

interface ConversationItemProps {
  conversation: Conversation;
  isActive: boolean;
  onSelect: () => void;
  currentUserId: string;
}

export default function ConversationItem({
  conversation,
  isActive,
  onSelect,
  currentUserId,
}: ConversationItemProps) {
  const { unreadCounts } = useNotifications();
  const unreadCount = unreadCounts[conversation.id] || 0;

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getConversationName = () => {
    if (conversation.type === "direct" && conversation.members) {
      const otherMember = conversation.members.find(
        (member) => member.id !== currentUserId,
      );
      return otherMember?.name || "Unknown User";
    }
    
    if (conversation.name) return conversation.name;
    return "Unnamed Chat";
  };

  const getMemberCount = () => {
    return conversation.members?.length || 0;
  };

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full p-3 text-left border-b border-zinc-700/30 hover:bg-zinc-700/50 transition-colors rounded-none relative ${
        isActive ? "bg-zinc-700" : ""
      } ${unreadCount > 0 ? "bg-zinc-700/30" : ""}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <div
              className={`w-2 h-2 rounded-full ${
                conversation.type === "group" ? "bg-green-500" : "bg-blue-500"
              }`}
            />
            <h3 className={`font-medium truncate ${unreadCount > 0 && !isActive ? "text-white font-semibold" : "text-white"}`}>
              {getConversationName()}
            </h3>
            {unreadCount > 0 && (
              <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full min-w-[20px] h-5">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 mb-1">
            <span
              className={`text-xs px-2 py-0.5 rounded-full text-white ${
                conversation.type === "group" ? "bg-green-600" : "bg-blue-600"
              }`}
            >
              {conversation.type}
            </span>
            {conversation.type === "group" && (
              <span className="text-xs text-zinc-300 bg-zinc-600 px-2 py-0.5 rounded-full">
                {getMemberCount()}
              </span>
            )}
          </div>
          {conversation.lastMessage && (
            <p className={`text-sm truncate ${unreadCount > 0 && !isActive ? "text-zinc-300 font-medium" : "text-zinc-400"}`}>
              {conversation.lastMessage.content}
            </p>
          )}
        </div>
        <div className="flex flex-col items-end gap-1">
          {conversation.lastMessage && (
            <span className="text-xs text-zinc-500">
              {formatTime(conversation.lastMessage.createdAt)}
            </span>
          )}
          {unreadCount > 0 && !isActive && (
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          )}
        </div>
      </div>
    </button>
  );
}
