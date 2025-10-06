"use client";

import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { useAuth } from "@/context/AuthContext";
import { useWebSocket } from "@/context/WebSocketContext";
import toast from "react-hot-toast";
import type { Conversation, Message } from "@/types";
import MessageActionsDropdown from "./message/MessageActionsDropdown";
import EditMessageModal from "./message/EditMessageModal";
import DeleteConfirmationModal from "./message/DeleteConfirmationModal";
import ThinkingMessage from "./ThinkingMessage";
import FloatingLLMButton from "./FloatingLLMButton";

interface ChatAreaProps {
  conversation: Conversation | null;
  messages: Message[];
  onSendMessage: (message: string) => void;
  isConnected?: boolean;
  isThinking?: boolean;
  setConversations?: (fn: (prev: Conversation[]) => Conversation[]) => void;
  setActiveConversationId?: (id: string) => void;
  conversations?: Conversation[];
}

export default function ChatArea({
  conversation,
  messages,
  onSendMessage,
  isConnected = true,
  isThinking = false,
  setConversations,
  setActiveConversationId,
  conversations,
}: ChatAreaProps) {
  const { user } = useAuth();
  const { editMessage, deleteMessage } = useWebSocket();
  const [messageInput, setMessageInput] = useState("");
  const [selectedMessageActions, setSelectedMessageActions] = useState<{
    message: Message;
    position: { x: number; y: number };
  } | null>(null);
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const [deletingMessage, setDeletingMessage] = useState<Message | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (messageInput.trim()) {
      onSendMessage(messageInput.trim());
      setMessageInput("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      if (messageInput.trim()) {
        onSendMessage(messageInput.trim());
        setMessageInput("");
      }
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleMessageRightClick = (e: React.MouseEvent, message: Message) => {
    e.preventDefault();
    
    if (message.senderId !== user?.id) return;
    
    setSelectedMessageActions({
      message,
      position: { x: e.clientX, y: e.clientY }
    });
  };

  const handleEditMessage = async (messageId: string, newContent: string) => {
    try {
      await editMessage(messageId, newContent);
      toast.success("Message updated");
    } catch (error) {
      toast.error("Failed to update message");
      throw error;
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    try {
      await deleteMessage(messageId);
      toast.success("Message deleted");
    } catch (error) {
      toast.error("Failed to delete message");
      throw error;
    }
  };

  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center bg-zinc-900 relative">
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
        {setConversations && setActiveConversationId && conversations && (
          <FloatingLLMButton 
            setConversations={setConversations}
            setActiveConversationId={setActiveConversationId}
            conversations={conversations}
          />
        )}
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
                    className={`px-4 py-2 rounded-lg cursor-pointer ${
                      isOwnMessage
                        ? "bg-blue-600 text-white"
                        : "bg-zinc-700 text-white"
                    }`}
                    onContextMenu={(e) => handleMessageRightClick(e, message)}
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
                      className={`text-xs mt-1 flex items-center gap-1 ${isOwnMessage ? "text-blue-100" : "text-zinc-400"}`}
                    >
                      <span>{formatTime(message.createdAt)}</span>
                      {message.updatedAt && (
                        <span className="italic">(edited)</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
        {isThinking && conversation?.type === "llm" && (
          <ThinkingMessage assistantName={conversation.name || "AI Assistant"} />
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-zinc-700 bg-zinc-800">
        <div className="px-4 py-2 border-b border-zinc-700">
          <div className="text-sm text-zinc-400">
            markdown auto-preview
          </div>
        </div>
        
        <div className="p-4">
          <form onSubmit={handleSendMessage} className="flex flex-col space-y-2">
            <div className="relative">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="relative">
                  <Textarea
                    value={messageInput}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setMessageInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={isConnected ? "type markdown here... (⌘+Enter to send)" : "connecting..."}
                    className="min-h-24 max-h-32 font-mono text-sm"
                    disabled={!isConnected}
                    rows={4}
                  />
                </div>
                
                <div className="hidden md:block">
                  <div className="min-h-24 max-h-32 overflow-y-auto p-3 bg-zinc-700 rounded border border-zinc-600">
                    {messageInput.trim() ? (
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
                    ) : (
                      <div className="text-zinc-500 text-sm italic">
                        preview will appear here...
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {messageInput.trim() && (
                <div className="md:hidden mt-3 p-3 bg-zinc-700 rounded border border-zinc-600">
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
              )}
            </div>
            
            <div className="flex justify-end">
              <Button type="submit" disabled={!messageInput.trim() || !isConnected}>
                send
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Message Actions Dropdown */}
      {selectedMessageActions && (
        <MessageActionsDropdown
          onEdit={() => {
            setEditingMessage(selectedMessageActions.message);
            setSelectedMessageActions(null);
          }}
          onDelete={() => {
            setDeletingMessage(selectedMessageActions.message);
            setSelectedMessageActions(null);
          }}
          onClose={() => setSelectedMessageActions(null)}
          position={selectedMessageActions.position}
        />
      )}

      {/* Edit Message Modal */}
      {editingMessage && (
        <EditMessageModal
          message={editingMessage}
          onSave={handleEditMessage}
          onClose={() => setEditingMessage(null)}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deletingMessage && (
        <DeleteConfirmationModal
          onConfirm={() => handleDeleteMessage(deletingMessage.id)}
          onClose={() => setDeletingMessage(null)}
        />
      )}
    </div>
  );
}
