"use client";

import React from 'react';
import Link from 'next/link';

export interface NotificationData {
  id: string;
  type: 'market_resolved' | 'stake_received' | 'new_follower';
  payload: Record<string, any>;
  isRead: boolean;
  createdAt: string;
  resourceId?: string;
  resourceType?: string;
}

interface NotificationItemProps {
  notification: NotificationData;
  onMarkAsRead?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function NotificationItem({
  notification,
  onMarkAsRead,
  onDelete,
}: NotificationItemProps) {
  const handleClick = () => {
    if (!notification.isRead && onMarkAsRead) {
      onMarkAsRead(notification.id);
    }
  };

  const getResourceLink = (): string => {
    if (notification.resourceType === 'call' && notification.resourceId) {
      return `/calls/${notification.resourceId}`;
    } else if (notification.resourceType === 'user' && notification.resourceId) {
      return `/profile/${notification.resourceId}`;
    }
    return '#';
  };

  const renderContent = () => {
    switch (notification.type) {
      case 'market_resolved': {
        const { callTitle, outcome, userWon } = notification.payload;
        return (
          <div>
            <p className="font-semibold text-gray-900">
              Market Resolved: {callTitle}
            </p>
            <p className="text-sm text-gray-600">
              Outcome: <span className="font-medium">{outcome.toUpperCase()}</span>
              {userWon !== undefined && (
                <>
                  {' '}
                  • You{' '}
                  <span className={userWon ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                    {userWon ? 'won' : 'lost'}
                  </span>
                </>
              )}
            </p>
          </div>
        );
      }
      case 'stake_received': {
        const { callTitle, staker, amount, choice } = notification.payload;
        return (
          <div>
            <p className="font-semibold text-gray-900">New Stake on {callTitle}</p>
            <p className="text-sm text-gray-600">
              <span className="font-medium truncate">{staker.slice(0, 6)}...</span> staked{' '}
              <span className="font-medium">{amount}</span> on {choice.toUpperCase()}
            </p>
          </div>
        );
      }
      case 'new_follower': {
        const { followerHandle, follower } = notification.payload;
        return (
          <div>
            <p className="font-semibold text-gray-900">New Follower</p>
            <p className="text-sm text-gray-600">
              <span className="font-medium">{followerHandle || follower.slice(0, 6) + '...'}</span> started
              following you
            </p>
          </div>
        );
      }
      default:
        return null;
    }
  };

  const link = getResourceLink();

  return (
    <Link href={link}>
      <div
        onClick={handleClick}
        className={`px-4 py-3 border-b border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors ${
          !notification.isRead ? 'bg-blue-50' : ''
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            {renderContent()}
            <p className="text-xs text-gray-400 mt-1">
              {new Date(notification.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
          {!notification.isRead && (
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
          )}
        </div>
      </div>
    </Link>
  );
}
