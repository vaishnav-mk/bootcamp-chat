"use client";

interface AddMemberInputProps {
  value: string;
  onChange: (value: string) => void;
  onAdd: () => void;
  isSearching: boolean;
  disabled: boolean;
  conversationType: "direct" | "group";
}

export default function AddMemberInput({
  value,
  onChange,
  onAdd,
  isSearching,
  disabled,
  conversationType,
}: AddMemberInputProps) {
  return (
    <div>
      <label htmlFor="usernameInput" className="block text-sm font-medium text-zinc-300 mb-2">
        add members by username{" "}
        {conversationType === "group" && <span className="text-zinc-400">(max 10)</span>}
      </label>
      <div className="flex space-x-2 mb-3">
        <input
          id="usernameInput"
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value.toLowerCase())}
          placeholder="enter username"
          className="flex-1 px-3 py-2 bg-zinc-700 border border-zinc-600 text-white placeholder-zinc-400 focus:outline-none focus:border-blue-500"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              onAdd();
            }
          }}
        />
        <button
          type="button"
          onClick={onAdd}
          disabled={isSearching || !value.trim() || disabled}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-600 text-white transition-colors"
        >
          {isSearching ? "..." : "add"}
        </button>
      </div>
    </div>
  );
}