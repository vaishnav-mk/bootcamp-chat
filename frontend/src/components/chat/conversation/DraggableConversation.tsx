"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Conversation } from "@/types";
import ConversationItem from "./ConversationItem";

interface DraggableConversationProps {
  conversation: Conversation;
  isActive: boolean;
  onSelect: () => void;
  currentUserId: string;
}

export default function DraggableConversation({
  conversation,
  isActive,
  onSelect,
  currentUserId,
}: DraggableConversationProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: conversation.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={`${isDragging ? "opacity-50" : ""}`}
    >
      <div className="flex items-start">
        <div
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-3 text-zinc-500 hover:text-zinc-300 flex-shrink-0"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="currentColor"
            aria-label="drag handle"
          >
            <title>drag handle</title>
            <circle cx="3" cy="3" r="1.5" />
            <circle cx="3" cy="8" r="1.5" />
            <circle cx="3" cy="13" r="1.5" />
            <circle cx="8" cy="3" r="1.5" />
            <circle cx="8" cy="8" r="1.5" />
            <circle cx="8" cy="13" r="1.5" />
          </svg>
        </div>
        <div className="flex-1 -ml-1">
          <ConversationItem
            conversation={conversation}
            isActive={isActive}
            onSelect={onSelect}
            currentUserId={currentUserId}
          />
        </div>
      </div>
    </div>
  );
}
