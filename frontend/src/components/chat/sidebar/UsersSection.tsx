"use client";

import { useState } from "react";
import type { User } from "@/types";
import UserDropdown from "./UserDropdown";

interface UsersSectionProps {
  users: User[];
  currentUserId: string;
  onStartDirectMessage: (userId: string) => void;
}

export default function UsersSection({
  users,
  currentUserId,
  onStartDirectMessage,
}: UsersSectionProps) {
  const [selectedUser, setSelectedUser] = useState<{
    user: User;
    position: { x: number; y: number };
  } | null>(null);

  const otherUsers = users.filter((user) => user.id !== currentUserId);

  if (otherUsers.length === 0) return null;

  return (
    <div className="relative">
      <div className="px-4 py-2 bg-zinc-800/50 border-b border-zinc-700/30">
        <h4 className="text-xs font-medium text-zinc-400 tracking-wide">
          users ({otherUsers.length})
        </h4>
      </div>
      
      <div className="p-2 space-y-1">
        {otherUsers.map((user) => (
          <button
            key={user.id}
            onClick={(e) => {
              setSelectedUser({
                user,
                position: { x: e.clientX, y: e.clientY },
              });
            }}
            className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-zinc-700/50 transition-colors text-left"
          >
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-medium text-white">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {user.name}
              </p>
              <p className="text-xs text-zinc-400 truncate">
                @{user.username}
              </p>
            </div>
            <div className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
          </button>
        ))}
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