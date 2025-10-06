import { useState, useEffect, useRef } from 'react';
import { useWebSocket } from '@/context/WebSocketContext';
import { useAuth } from '@/context/AuthContext';
import { messageApi } from '@/lib/api';

interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  messageType: string;
  createdAt: string;
  sender: {
    id: string;
    username: string;
    name: string;
  };
}

interface ChatProps {
  conversationId: string;
  currentUserId: string;
}

export const Chat: React.FC<ChatProps> = ({ conversationId, currentUserId }) => {
  const { sendMessage, isConnected, joinConversations } = useWebSocket();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (conversationId) {
      joinConversations([conversationId]);
      loadMessages();
    }
  }, [conversationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async () => {
    try {
      const data = await messageApi.getConversationMessages(conversationId);
      setMessages(data.messages || []);
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim()) return;

    setLoading(true);
    try {
      if (isConnected) {
        await sendMessage({
          conversation_id: conversationId,
          content: newMessage.trim(),
          message_type: 'text'
        });
      } else {
        const data = await messageApi.createMessage({
          conversation_id: conversationId,
          content: newMessage.trim(),
          message_type: 'text'
        });
        setMessages(prev => [...prev, data.message]);
      }
      setNewMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b bg-gray-50">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-sm text-gray-600">
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => {
          const isOwn = message.senderId === currentUserId;
          
          return (
            <div
              key={message.id}
              className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                isOwn 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 text-gray-900'
              }`}>
                {!isOwn && (
                  <div className="text-xs font-semibold mb-1">
                    {message.sender.name || message.sender.username}
                  </div>
                )}
                <div className="break-words">{message.content}</div>
                <div className={`text-xs mt-1 ${
                  isOwn ? 'text-blue-100' : 'text-gray-500'
                }`}>
                  {formatTime(message.createdAt)}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t bg-white">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={isConnected ? "Type a message..." : "Type a message (will send via REST API)..."}
            disabled={loading}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || loading}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Sending...' : 'Send'}
          </button>
        </div>
      </form>
    </div>
  );
};