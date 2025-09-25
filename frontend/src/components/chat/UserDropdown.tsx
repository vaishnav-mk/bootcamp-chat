"use client";

import { useState, useRef, useEffect } from "react";
import type { User } from "@/types";

interface UserDropdownProps {
  user: User;
  onStartDirectMessage: (userId: string) => void;
  onClose: () => void;
  position: { x: number; y: number };
}

export default function UserDropdown({
  user,
  onStartDirectMessage,
  onClose,
  position,
}: UserDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const handleStartDM = () => {
    onStartDirectMessage(user.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50">
      <div
        ref={dropdownRef}
        className="absolute bg-zinc-800 border border-zinc-700 rounded-lg shadow-xl min-w-48 p-3"
        style={{
          left: Math.min(position.x, window.innerWidth - 200),
          top: Math.min(position.y, window.innerHeight - 150),
        }}
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="font-medium text-white">{user.name}</h3>
            <p className="text-sm text-zinc-400">@{user.username}</p>
          </div>
        </div>
        
        <button
          onClick={handleStartDM}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded transition-colors text-sm"
        >
          start direct message
        </button>
      </div>
    </div>
  );
}