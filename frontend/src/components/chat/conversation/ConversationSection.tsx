"use client";

import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useNotifications } from "@/context/NotificationContext";
import type { Conversation } from "@/types";
import DraggableConversation from "./DraggableConversation";

interface ConversationSectionProps {
  title: string;
  conversations: Conversation[];
  activeConversationId: string | null;
  onConversationSelect: (id: string) => void;
  currentUserId: string;
}

export default function ConversationSection({
  title,
  conversations,
  activeConversationId,
  onConversationSelect,
  currentUserId,
}: ConversationSectionProps) {
  const { unreadCounts } = useNotifications();
  
  if (conversations.length === 0) return null;

  const sectionUnreadCount = conversations.reduce((total, conv) => {
    return total + (unreadCounts[conv.id] || 0);
  }, 0);

  return (
    <div>
      <div className="px-4 py-2 bg-zinc-800/50 border-b border-zinc-700/30">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-medium text-zinc-400 tracking-wide">
            {title} ({conversations.length})
          </h4>
          {sectionUnreadCount > 0 && (
            <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full min-w-[20px] h-4">
              {sectionUnreadCount > 99 ? "99+" : sectionUnreadCount}
            </span>
          )}
        </div>
      </div>
      <SortableContext
        items={conversations.map((c) => c.id)}
        strategy={verticalListSortingStrategy}
      >
        {conversations.map((conversation) => (
          <DraggableConversation
            key={conversation.id}
            conversation={conversation}
            isActive={activeConversationId === conversation.id}
            onSelect={() => onConversationSelect(conversation.id)}
            currentUserId={currentUserId}
          />
        ))}
      </SortableContext>
    </div>
  );
}
