"use client";

interface User {
  id: string;
  name: string;
  username: string;
}

interface MemberListProps {
  members: User[];
  onRemoveMember: (userId: string) => void;
}

export default function MemberList({ members, onRemoveMember }: MemberListProps) {
  if (members.length === 0) return null;

  return (
    <div className="space-y-2 max-h-48 overflow-y-auto">
      <div className="text-sm text-zinc-400 mb-2">selected members:</div>
      {members.map((user) => (
        <div
          key={user.id}
          className="flex items-center justify-between p-2 bg-blue-600 text-white"
        >
          <div className="flex items-center">
            <div className="w-8 h-8 bg-purple-600 flex items-center justify-center text-white text-sm mr-3">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="font-medium">{user.name}</div>
              <div className="text-sm text-blue-200">@{user.username}</div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onRemoveMember(user.id)}
            className="text-blue-200 hover:text-white"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}