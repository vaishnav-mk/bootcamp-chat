"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";

interface DeleteConfirmationModalProps {
  onConfirm: () => Promise<void>;
  onClose: () => void;
}

export default function DeleteConfirmationModal({
  onConfirm,
  onClose
}: DeleteConfirmationModalProps) {
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

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      await onConfirm();
      onClose();
    } catch (error) {
      console.error('Failed to delete message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-800 border border-zinc-700 rounded-lg w-full max-w-md">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-red-600/20 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-medium text-white">delete message</h3>
              <p className="text-sm text-zinc-400">this action cannot be undone</p>
            </div>
          </div>

          <p className="text-zinc-300 mb-6">
            are you sure you want to delete this message? it will be permanently removed from the conversation.
          </p>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={onClose} disabled={isLoading}>
              cancel
            </Button>
            <Button 
              type="button" 
              variant="danger" 
              onClick={handleConfirm}
              disabled={isLoading}
            >
              {isLoading ? "deleting..." : "delete message"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}