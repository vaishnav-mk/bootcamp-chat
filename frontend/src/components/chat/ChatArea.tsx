"use client";

import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { useAuth } from "@/context/AuthContext";
import type { Conversation, Message } from "@/types";

interface ChatAreaProps {
  conversation?: Conversation;
  messages: Message[];
  onSendMessage: (content: string) => void;
  isConnected?: boolean;
}

export default function ChatArea({
  conversation,
  messages,
  onSendMessage,
  isConnected = true,
}: ChatAreaProps) {
  const { user } = useAuth();
  const [messageInput, setMessageInput] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (messageInput.trim()) {
      onSendMessage(messageInput.trim());
      setMessageInput("");
      setShowPreview(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      if (messageInput.trim()) {
        onSendMessage(messageInput.trim());
        setMessageInput("");
        setShowPreview(false);
      }
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center bg-zinc-900">
        <div className="text-center">
          <div className="w-16 h-16 bg-zinc-700 rounded-full mx-auto mb-4 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-zinc-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-white mb-2">
            no conversation selected
          </h3>
          <p className="text-zinc-400">
            choose a conversation from the sidebar to start chatting
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-zinc-900">
      <div className="p-4 border-b border-zinc-700 bg-zinc-800">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium">
            {conversation.name ? conversation.name.charAt(0).toUpperCase() : "#"}
          </div>
          <div className="flex-1">
            <h2 className="font-medium text-white">{conversation.name || "chat"}</h2>
            <div className="flex items-center gap-2">
              <p className="text-sm text-zinc-400">
                {conversation.type === "group" ? "group chat" : "direct message"}
              </p>
              <div className="flex items-center gap-1">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="text-xs text-zinc-400">
                  {isConnected ? 'connected' : 'disconnected'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-zinc-400">
              no messages yet. start the conversation!
            </p>
          </div>
        ) : (
          messages.map((message) => {
            const isOwnMessage = message.senderId === user?.id;
            return (
              <div
                key={message.id}
                className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md ${isOwnMessage ? "order-2" : "order-1"}`}
                >
                  {!isOwnMessage && (
                    <div className="text-sm text-zinc-400 mb-1">
                      {message.sender?.name || "unknown user"}
                    </div>
                  )}
                  <div
                    className={`px-4 py-2 rounded-lg ${
                      isOwnMessage
                        ? "bg-blue-600 text-white"
                        : "bg-zinc-700 text-white"
                    }`}
                  >
                    <div className="prose prose-sm prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                          code: ({ children }) => (
                            <code className="bg-black/30 px-1 py-0.5 rounded text-sm font-mono">
                              {children}
                            </code>
                          ),
                          pre: ({ children }) => (
                            <pre className="bg-black/30 p-2 rounded text-sm font-mono overflow-x-auto my-2">
                              {children}
                            </pre>
                          ),
                          ul: ({ children }) => <ul className="my-1 ml-4">{children}</ul>,
                          ol: ({ children }) => <ol className="my-1 ml-4">{children}</ol>,
                          blockquote: ({ children }) => (
                            <blockquote className="border-l-2 border-zinc-500 pl-3 my-2 italic">
                              {children}
                            </blockquote>
                          ),
                        }}
                      >
                        {message.content}
                      </ReactMarkdown>
                    </div>
                    <div
                      className={`text-xs mt-1 ${isOwnMessage ? "text-blue-100" : "text-zinc-400"}`}
                    >
                      {formatTime(message.createdAt)}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-zinc-700 bg-zinc-800">
        <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-700">
          <div className="text-sm text-zinc-400">
            markdown supported
          </div>
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
            disabled={!messageInput.trim()}
          >
            {showPreview ? "edit" : "preview"}
          </button>
        </div>
        
        <div className="p-4">
          {showPreview && messageInput.trim() ? (
            <div className="min-h-20 max-h-32 overflow-y-auto p-3 bg-zinc-700 rounded border mb-3">
              <div className="prose prose-sm prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                    code: ({ children }) => (
                      <code className="bg-black/30 px-1 py-0.5 rounded text-sm font-mono">
                        {children}
                      </code>
                    ),
                    pre: ({ children }) => (
                      <pre className="bg-black/30 p-2 rounded text-sm font-mono overflow-x-auto my-2">
                        {children}
                      </pre>
                    ),
                    ul: ({ children }) => <ul className="my-1 ml-4">{children}</ul>,
                    ol: ({ children }) => <ol className="my-1 ml-4">{children}</ol>,
                    blockquote: ({ children }) => (
                      <blockquote className="border-l-2 border-zinc-500 pl-3 my-2 italic">
                        {children}
                      </blockquote>
                    ),
                  }}
                >
                  {messageInput}
                </ReactMarkdown>
              </div>
            </div>
          ) : null}
          
          <form onSubmit={handleSendMessage} className="flex flex-col space-y-2">
            <Textarea
              value={messageInput}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setMessageInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isConnected ? "type a message... (markdown supported, ⌘+Enter to send)" : "connecting..."}
              className="min-h-20 max-h-32"
              disabled={!isConnected}
              rows={3}
            />
            <div className="flex justify-end">
              <Button type="submit" disabled={!messageInput.trim() || !isConnected}>
                send
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
