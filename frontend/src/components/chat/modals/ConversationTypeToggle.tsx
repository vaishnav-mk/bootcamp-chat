"use client";

interface ConversationTypeToggleProps {
  conversationType: "direct" | "group";
  onChange: (type: "direct" | "group") => void;
}

export default function ConversationTypeToggle({
  conversationType,
  onChange,
}: ConversationTypeToggleProps) {
  return (
    <div className="flex bg-zinc-700 p-1 rounded">
      <button
        type="button"
        onClick={() => onChange("direct")}
        className={`flex-1 py-2 px-4 text-sm font-medium transition-colors ${
          conversationType === "direct"
            ? "bg-blue-600 text-white"
            : "text-zinc-300 hover:text-white"
        }`}
      >
        direct message
      </button>
      <button
        type="button"
        onClick={() => onChange("group")}
        className={`flex-1 py-2 px-4 text-sm font-medium transition-colors ${
          conversationType === "group"
            ? "bg-blue-600 text-white"
            : "text-zinc-300 hover:text-white"
        }`}
      >
        group chat
      </button>
    </div>
  );
}