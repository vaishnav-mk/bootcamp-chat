"use client";

import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";

interface SidebarHeaderProps {
  onNewChat: () => void;
}

export default function SidebarHeader({ onNewChat }: SidebarHeaderProps) {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <div className="p-4 border-b border-zinc-700">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="font-semibold text-white">{user.name}</h2>
            <p className="text-sm text-zinc-400">@{user.username}</p>
          </div>
        </div>
        <Button variant="ghost" onClick={logout} className="text-sm p-2">
          logout
        </Button>
      </div>
      <Button onClick={onNewChat} className="w-full">
        new chat
      </Button>
    </div>
  );
}
