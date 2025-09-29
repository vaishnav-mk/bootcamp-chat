"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { userApi } from "@/lib/api";
import ConversationTypeToggle from "./ConversationTypeToggle";
import AddMemberInput from "./AddMemberInput";
import MemberList from "./MemberList";

interface CreateConversationModalProps {
  onClose: () => void;
  onCreateConversation: (data: {
    type: "direct" | "group";
    name: string;
    member_ids: string[];
  }) => void;
}

interface User {
  id: string;
  name: string;
  username: string;
}

export default function CreateConversationModal({
  onClose,
  onCreateConversation,
}: CreateConversationModalProps) {
  const [conversationType, setConversationType] = useState<"direct" | "group">("direct");
  const [conversationName, setConversationName] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<User[]>([]);
  const [usernameInput, setUsernameInput] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const addUserByUsername = async () => {
    if (!usernameInput.trim()) return;

    if (conversationType === "group" && selectedMembers.length >= 10) {
      toast.error("maximum 10 members allowed in a group");
      return;
    }

    setIsSearching(true);
    try {
      const response = await userApi.getUserByUsername(usernameInput.trim());
      const user = response.user;

      if (selectedMembers.find((m) => m.id === user.id)) {
        toast.error("user already added");
        return;
      }

      if (conversationType === "direct") {
        setSelectedMembers([user]);
      } else {
        setSelectedMembers((prev) => [...prev, user]);
      }

      setUsernameInput("");
    } catch {
      toast.error("user not found");
    } finally {
      setIsSearching(false);
    }
  };

  const removeMember = (userId: string) => {
    setSelectedMembers((prev) => prev.filter((member) => member.id !== userId));
  };

  const handleTypeChange = (type: "direct" | "group") => {
    setConversationType(type);
    setSelectedMembers([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (conversationType === "direct" && selectedMembers.length !== 1) {
      toast.error("please select exactly one person for direct message");
      return;
    }

    if (conversationType === "group" && selectedMembers.length < 1) {
      toast.error("please select at least one person for group chat");
      return;
    }

    const name =
      conversationType === "direct"
        ? selectedMembers[0]?.name || "direct message"
        : conversationName || "group chat";

    setIsCreating(true);
    try {
      await onCreateConversation({
        type: conversationType,
        name,
        member_ids: selectedMembers.map((m) => m.id),
      });
      toast.success("conversation created successfully!");
      onClose();
    } catch {
      toast.error("failed to create conversation. please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-zinc-800 border border-zinc-700 w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-4 border-b border-zinc-700">
          <h2 className="text-lg font-medium text-white">new conversation</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-zinc-400 hover:text-white"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <ConversationTypeToggle conversationType={conversationType} onChange={handleTypeChange} />

          <div>
            <label htmlFor="conversationTitle" className="block text-sm font-medium text-zinc-300 mb-2">
              {conversationType === "direct" ? "direct message title (optional)" : "group chat title"}
            </label>
            <input
              id="conversationTitle"
              type="text"
              value={conversationName}
              onChange={(e) => setConversationName(e.target.value.toLowerCase())}
              placeholder={conversationType === "direct" ? "optional title" : "enter group name"}
              className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 text-white placeholder-zinc-400 focus:outline-none focus:border-blue-500"
            />
          </div>

          <AddMemberInput
            value={usernameInput}
            onChange={setUsernameInput}
            onAdd={addUserByUsername}
            isSearching={isSearching}
            disabled={conversationType === "group" && selectedMembers.length >= 10}
            conversationType={conversationType}
          />

          <MemberList members={selectedMembers} onRemoveMember={removeMember} />

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-zinc-700 hover:bg-zinc-600 text-white py-2 px-4 transition-colors duration-200"
            >
              cancel
            </button>
            <button
              type="submit"
              disabled={isCreating}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-600 text-white py-2 px-4 transition-colors duration-200"
            >
              {isCreating ? "creating..." : "create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
