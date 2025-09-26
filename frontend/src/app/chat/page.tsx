'use client';

import { useState, useEffect } from 'react';
import { WebSocketProvider } from '@/context/WebSocketContext';
import { Chat } from '@/components/chat/Chat';

interface Conversation {
  id: string;
  name: string;
  type: string;
}

export default function ChatPage() {
  const [token, setToken] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
      try {
        const payload = JSON.parse(atob(storedToken.split('.')[1]));
        setCurrentUserId(payload.userId);
      } catch (error) {
        console.error('Failed to decode token:', error);
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (token) loadConversations();
  }, [token]);

  const loadConversations = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/conversations', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setConversations(data.conversations || []);
        if (data.conversations?.[0]) setSelectedConversationId(data.conversations[0].id);
      }
    } catch (error) {
      console.error('Failed to load conversations:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h1>
          <p className="text-gray-600">Please log in to access the chat.</p>
        </div>
      </div>
    );
  }

  return (
    <WebSocketProvider token={token}>
      <div className="min-h-screen bg-gray-100">
        <div className="container mx-auto h-screen flex">
          <div className="w-1/3 bg-white border-r border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h1 className="text-xl font-semibold text-gray-900">Conversations</h1>
            </div>
            <div className="overflow-y-auto">
              {conversations.length === 0 ? (
                <div className="p-4 text-center text-gray-500">No conversations found</div>
              ) : (
                conversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    onClick={() => setSelectedConversationId(conversation.id)}
                    className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                      selectedConversationId === conversation.id ? 'bg-blue-50 border-blue-200' : ''
                    }`}
                  >
                    <h3 className="font-medium text-gray-900">
                      {conversation.name || `${conversation.type} conversation`}
                    </h3>
                    <p className="text-sm text-gray-500 capitalize">{conversation.type}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="flex-1 bg-white">
            {selectedConversationId ? (
              <Chat conversationId={selectedConversationId} currentUserId={currentUserId} />
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                Select a conversation to start chatting
              </div>
            )}
          </div>
        </div>
      </div>
    </WebSocketProvider>
  );
}