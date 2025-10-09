"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import MarkdownRenderer from "../MarkdownRenderer";

interface EditMessageModalProps {
  message: {
    id: string;
    content: string;
  };
  onSave: (messageId: string, newContent: string) => Promise<void>;
  onClose: () => void;
}

export default function EditMessageModal({
  message,
  onSave,
  onClose
}: EditMessageModalProps) {
  const [content, setContent] = useState(message.content);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || content === message.content) return;

    setIsLoading(true);
    try {
      await onSave(message.id, content.trim());
      onClose();
    } catch (error) {
      console.error('Failed to edit message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      if (content.trim() && content !== message.content) {
        handleSubmit(e);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-800 border border-zinc-700 rounded-lg w-full max-w-2xl">
        <div className="flex items-center justify-between p-4 border-b border-zinc-700">
          <h2 className="text-lg font-medium text-white">edit message</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-zinc-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">
                content (markdown supported)
              </label>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="edit your message..."
                className="min-h-32 max-h-64 font-mono text-sm"
                disabled={isLoading}
                rows={6}
                autoFocus
              />
            </div>
            
            <div className="hidden md:block">
              <label className="block text-sm font-medium text-zinc-400 mb-2">
                preview
              </label>
              <div className="min-h-32 max-h-64 overflow-y-auto p-3 bg-zinc-700 rounded border border-zinc-600">
                {content.trim() ? (
                  <div className="prose prose-sm prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                    <MarkdownRenderer content={content} />
                  </div>
                ) : (
                  <div className="text-zinc-500 text-sm italic">
                    preview will appear here...
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {content.trim() && (
            <div className="md:hidden mt-4 p-3 bg-zinc-700 rounded border border-zinc-600">
              <div className="prose prose-sm prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                <MarkdownRenderer content={content} />
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 mt-6">
            <Button type="button" variant="ghost" onClick={onClose} disabled={isLoading}>
              cancel
            </Button>
            <Button
              type="submit"
              disabled={!content.trim() || content === message.content || isLoading}
            >
              {isLoading ? "saving..." : "save changes"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}