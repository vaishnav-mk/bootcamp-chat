"use client";

import { useState } from "react";
import Image from "next/image";
import type { Conversation, User } from "@/types";
import UserDropdown from "./UserDropdown";

interface MembersSidebarProps {
  conversation: Conversation | undefined;
  currentUserId: string;
  onStartDirectMessage: (userId: string) => void;
}

export default function MembersSidebar({
  conversation,
  currentUserId,
  onStartDirectMessage,
}: MembersSidebarProps) {
  const [selectedUser, setSelectedUser] = useState<{ user: User; position: { x: number; y: number } } | null>(null);
  if (!conversation) {
    return (
      <div className="w-64 bg-zinc-800/50 border-l border-zinc-700 flex items-center justify-center">
        <p className="text-zinc-400 text-sm">select a conversation</p>
      </div>
    );
  }

  if (conversation.type !== "group") {
    return null;
  }

  const members = conversation.members || [];
  const memberCount = members.length;

  return (
    <div className="w-64 bg-zinc-800/50 border-l border-zinc-700 flex flex-col relative">
      <div className="p-4 border-b border-zinc-700">
        <h3 className="font-semibold text-white">
          members ({memberCount})
        </h3>
        {conversation.name && (
          <p className="text-sm text-zinc-400 mt-1">
            {conversation.name}
          </p>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {members.length === 0 ? (
          <div className="p-4 text-center">
            <p className="text-sm text-zinc-400">no members found</p>
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {members.map((member) => (
              <MemberItem
                key={member.id}
                member={member}
                isCurrentUser={member.id === currentUserId}
                onUserClick={(user, event) => {
                  if (user.id !== currentUserId) {
                    setSelectedUser({
                      user,
                      position: { x: event.clientX, y: event.clientY }
                    });
                  }
                }}
              />
            ))}
          </div>
        )}
      </div>

      {selectedUser && (
        <UserDropdown
          user={selectedUser.user}
          onStartDirectMessage={onStartDirectMessage}
          onClose={() => setSelectedUser(null)}
          position={selectedUser.position}
        />
      )}
    </div>
  );
}

interface MemberItemProps {
  member: User;
  isCurrentUser: boolean;
  onUserClick: (user: User, event: React.MouseEvent) => void;
}

function MemberItem({ member, isCurrentUser, onUserClick }: MemberItemProps) {
  return (
    <button 
      onClick={(e) => onUserClick(member, e)}
      className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-zinc-700/50 transition-colors text-left"
      disabled={isCurrentUser}
    >
      <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
        {member.avatar ? (
          <Image
            src={member.avatar}
            alt={member.name}
            width={32}
            height={32}
            className="w-8 h-8 rounded-full object-cover"
          />
        ) : (
          <span className="text-sm font-medium text-white">
            {member.name.charAt(0).toUpperCase()}
          </span>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-white truncate">
            {member.name}
          </p>
          {isCurrentUser && (
            <span className="text-xs text-zinc-400 bg-zinc-600 px-1.5 py-0.5 rounded">
              you
            </span>
          )}
        </div>
        <p className="text-xs text-zinc-400 truncate">
          @{member.username}
        </p>
      </div>

      <div className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
    </button>
  );
}
