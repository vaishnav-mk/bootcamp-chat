"use client";

import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import type { Conversation } from "@/types";
import ConversationSection from "../conversation/ConversationSection";
import CreateConversationModal from "../CreateConversationModal";
import SidebarHeader from "./SidebarHeader";
import QuickLLMChatButton from "../QuickLLMChatButton";

interface SidebarProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  onConversationSelect: (id: string) => void;
  onCreateConversation: (data: {
    type: "direct" | "group" | "llm";
    name: string;
    member_ids: string[];
  }) => void;
  onReorderConversations?: (conversations: Conversation[]) => void;
  setConversations: (fn: (prev: Conversation[]) => Conversation[]) => void;
  setActiveConversationId: (id: string) => void;
}

export default function Sidebar({
  conversations,
  activeConversationId,
  onConversationSelect,
  onCreateConversation,
  onReorderConversations,
  setConversations,
  setActiveConversationId,
}: SidebarProps) {
  const { user } = useAuth();
  const [showNewChat, setShowNewChat] = useState(false);
  const [conversationOrder, setConversationOrder] = useState(conversations);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const { directConversations, groupConversations, llmConversations } = useMemo(() => {
    const direct = conversationOrder.filter((c) => c.type === "direct");
    const group = conversationOrder.filter((c) => c.type === "group");
    const llm = conversationOrder.filter((c) => c.type === "llm");
    return { directConversations: direct, groupConversations: group, llmConversations: llm };
  }, [conversationOrder]);

  useEffect(() => {
    setConversationOrder(conversations);
  }, [conversations]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = conversationOrder.findIndex(
        (item) => item.id === active.id,
      );
      const newIndex = conversationOrder.findIndex(
        (item) => item.id === over.id,
      );

      const newOrder = arrayMove(conversationOrder, oldIndex, newIndex);
      setConversationOrder(newOrder);
      onReorderConversations?.(newOrder);
    }
  };

  if (!user) return null;

  return (
    <div className="w-80 bg-zinc-800 border-r border-zinc-700 flex flex-col h-full">
      <SidebarHeader onNewChat={() => setShowNewChat(true)} />

      {/* Quick LLM Chat Button */}
      <div className="p-3 border-b border-zinc-700">
        <QuickLLMChatButton 
          onCreateConversation={onCreateConversation}
          setConversations={setConversations}
          setActiveConversationId={setActiveConversationId}
          conversations={conversations}
        />
      </div>

      <div className="flex-1 overflow-y-auto">
        {conversationOrder.length === 0 ? (
          <div className="p-4 text-center text-zinc-400">
            no conversations yet. start a new chat!
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            {llmConversations.length > 0 && (
              <ConversationSection
                title="ai chats"
                conversations={llmConversations}
                activeConversationId={activeConversationId}
                onConversationSelect={onConversationSelect}
                currentUserId={user.id}
              />
            )}
            <ConversationSection
              title="groups"
              conversations={groupConversations}
              activeConversationId={activeConversationId}
              onConversationSelect={onConversationSelect}
              currentUserId={user.id}
            />
            <ConversationSection
              title="direct messages"
              conversations={directConversations}
              activeConversationId={activeConversationId}
              onConversationSelect={onConversationSelect}
              currentUserId={user.id}
            />
          </DndContext>
        )}
      </div>

      {showNewChat && (
        <CreateConversationModal
          onClose={() => setShowNewChat(false)}
          onCreateConversation={async (data) => {
            await onCreateConversation(data);
            setShowNewChat(false);
          }}
          conversations={conversations}
        />
      )}
    </div>
  );
}
