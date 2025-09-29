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
import CreateConversationModal from "../modals/CreateConversationModal";
import SidebarHeader from "./SidebarHeader";

interface SidebarProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  onConversationSelect: (id: string) => void;
  onCreateConversation: (data: {
    type: "direct" | "group";
    name: string;
    member_ids: string[];
  }) => void;
  onReorderConversations?: (conversations: Conversation[]) => void;
}

export default function Sidebar({
  conversations,
  activeConversationId,
  onConversationSelect,
  onCreateConversation,
  onReorderConversations,
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

  const { directConversations, groupConversations } = useMemo(() => {
    const direct = conversationOrder.filter((c) => c.type === "direct");
    const group = conversationOrder.filter((c) => c.type === "group");
    return { directConversations: direct, groupConversations: group };
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
        />
      )}
    </div>
  );
}
