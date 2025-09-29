"use client";

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { useAuth } from './AuthContext';

interface UnreadCounts {
  [conversationId: string]: number;
}

interface NotificationContextType {
  unreadCounts: UnreadCounts;
  markAsRead: (conversationId: string) => void;
  incrementUnread: (conversationId: string, senderId?: string) => void;
  getTotalUnreadCount: () => number;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [unreadCounts, setUnreadCounts] = useState<UnreadCounts>({});

  useEffect(() => {
    if (user?.id) {
      const stored = localStorage.getItem(`unreadCounts_${user.id}`);
      if (stored) {
        try {
          setUnreadCounts(JSON.parse(stored));
        } catch (error) {
          console.error('Failed to parse stored unread counts:', error);
        }
      }
    }
  }, [user?.id]);

  useEffect(() => {
    if (user?.id) {
      localStorage.setItem(`unreadCounts_${user.id}`, JSON.stringify(unreadCounts));
    }
  }, [unreadCounts, user?.id]);

  const markAsRead = useCallback((conversationId: string) => {
    setUnreadCounts(prev => {
      const newCounts = { ...prev };
      delete newCounts[conversationId];
      return newCounts;
    });
  }, []);

  const incrementUnread = useCallback((conversationId: string, senderId?: string) => {
    if (senderId === user?.id) return;
    
    setUnreadCounts(prev => ({
      ...prev,
      [conversationId]: (prev[conversationId] || 0) + 1
    }));
  }, [user?.id]);

  const getTotalUnreadCount = useCallback(() => {
    return Object.values(unreadCounts).reduce((total, count) => total + count, 0);
  }, [unreadCounts]);

  const value: NotificationContextType = {
    unreadCounts,
    markAsRead,
    incrementUnread,
    getTotalUnreadCount,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};