"use client";

import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
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
  if (conversations.length === 0) return null;

  return (
    <div>
      <div className="px-4 py-2 bg-zinc-800/50 border-b border-zinc-700/30">
        <h4 className="text-xs font-medium text-zinc-400 tracking-wide">
          {title} ({conversations.length})
        </h4>
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
