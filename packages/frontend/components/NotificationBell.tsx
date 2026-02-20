"use client";

import React, { useState, useEffect } from 'react';
import { NotificationDropdown } from './NotificationDropdown';
import { NotificationData } from './NotificationItem';

interface NotificationBellProps {
  userWallet?: string;
  pollingInterval?: number; // in milliseconds, default 30000 (30 seconds)
}

export function NotificationBell({
  userWallet,
  pollingInterval = 30000,
}: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch unread count
  const fetchUnreadCount = async () => {
    if (!userWallet) return;

    try {
      const response = await fetch(
        'http://localhost:3001/notifications/unread-count',
        {
          headers: {
            'x-user-wallet': userWallet,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setUnreadCount(data.unreadCount);
      }
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  };

  // Fetch notifications
  const fetchNotifications = async (page: number = 1) => {
    if (!userWallet) return;

    setIsLoading(true);
    try {
      const response = await fetch(
        `http://localhost:3001/notifications?page=${page}&limit=10`,
        {
          headers: {
            'x-user-wallet': userWallet,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (page === 1) {
          setNotifications(data.notifications);
        } else {
          setNotifications((prev) => [...prev, ...data.notifications]);
        }
        setCurrentPage(page);
        setTotalPages(data.totalPages);
        setHasMore(page < data.totalPages);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Mark notification as read
  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await fetch(`http://localhost:3001/notifications/${notificationId}/read`, {
        method: 'PATCH',
        headers: {
          'x-user-wallet': userWallet,
        },
      });

      setNotifications((prev) =>
        prev.map((notif) =>
          notif.id === notificationId ? { ...notif, isRead: true } : notif
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  // Mark all as read
  const handleMarkAllRead = async () => {
    try {
      await fetch(`http://localhost:3001/notifications/mark-all-read`, {
        method: 'PATCH',
        headers: {
          'x-user-wallet': userWallet,
        },
      });

      setNotifications((prev) =>
        prev.map((notif) => ({ ...notif, isRead: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  // Handle load more
  const handleLoadMore = () => {
    fetchNotifications(currentPage + 1);
  };

  // Set up polling and initial fetch when dropdown opens
  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  // Set up polling for unread count
  useEffect(() => {
    if (!userWallet) return;

    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, pollingInterval);

    return () => clearInterval(interval);
  }, [userWallet, pollingInterval]);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-indigo-600 transition-colors"
        aria-label="Notifications"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>

        {/* Unread indicator badge */}
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      <NotificationDropdown
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        notifications={notifications}
        unreadCount={unreadCount}
        isLoading={isLoading}
        onMarkAsRead={handleMarkAsRead}
        onMarkAllRead={handleMarkAllRead}
        onLoadMore={handleLoadMore}
        hasMore={hasMore}
      />
    </div>
  );
}
