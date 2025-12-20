'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { Check, FileText, Clock, AlertCircle, MessageSquare, Trophy, Bell } from 'lucide-react';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
} from '@/modules/notifications/actions/notification-actions';
import type { Notification } from '@prisma/client';

interface Props {
  onClose: () => void;
  onRead: () => void;
  onMarkAllRead: () => void;
}

const typeIcons: Record<string, typeof Bell> = {
  'brief.assigned': FileText,
  'brief.status_changed': FileText,
  'brief.deadline_24h': Clock,
  'brief.deadline_overdue': AlertCircle,
  'brief.comment': MessageSquare,
  'submission.received': FileText,
  'submission.approved': Check,
  'submission.rejected': AlertCircle,
  'rfp.won': Trophy,
  default: Bell,
};

const typeColors: Record<string, string> = {
  'brief.assigned': 'bg-blue-100 text-blue-600',
  'brief.deadline_overdue': 'bg-red-100 text-red-600',
  'submission.approved': 'bg-green-100 text-green-600',
  'submission.rejected': 'bg-red-100 text-red-600',
  'rfp.won': 'bg-yellow-100 text-yellow-600',
  default: 'bg-gray-100 text-gray-600',
};

export function NotificationDropdown({ onClose, onRead, onMarkAllRead }: Props) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getNotifications({ limit: 10 })
      .then((data) => setNotifications(data.notifications))
      .finally(() => setLoading(false));
  }, []);

  const handleMarkAsRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await markAsRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
    onRead();
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    onMarkAllRead();
  };

  const getIcon = (type: string) => {
    return typeIcons[type] || typeIcons.default;
  };

  const getIconColor = (type: string) => {
    return typeColors[type] || typeColors.default;
  };

  return (
    <div className="absolute right-0 top-full mt-2 w-96 bg-white rounded-xl border border-gray-200 shadow-lg z-50">
      <div className="p-4 border-b border-gray-100 flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">Notifications</h3>
        <button
          onClick={handleMarkAllAsRead}
          className="text-sm text-[#52EDC7] hover:text-[#3dd4b0] font-medium"
        >
          Mark all as read
        </button>
      </div>

      <div className="max-h-[400px] overflow-y-auto">
        {loading ? (
          <div className="p-8 text-center text-gray-500">
            <div className="animate-spin w-6 h-6 border-2 border-gray-300 border-t-[#52EDC7] rounded-full mx-auto" />
            <p className="mt-2 text-sm">Loading...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Bell className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p className="font-medium">No notifications</p>
            <p className="text-sm mt-1">You&apos;re all caught up!</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {notifications.map((notification) => {
              const Icon = getIcon(notification.type);
              const iconColor = getIconColor(notification.type);

              return (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                    !notification.isRead ? 'bg-blue-50/30' : ''
                  }`}
                  onClick={() => {
                    if (notification.actionUrl) {
                      window.location.href = notification.actionUrl;
                      onClose();
                    }
                  }}
                >
                  <div className="flex gap-3">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${iconColor}`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p
                          className={`text-sm ${
                            !notification.isRead
                              ? 'font-semibold text-gray-900'
                              : 'font-medium text-gray-700'
                          }`}
                        >
                          {notification.title}
                        </p>
                        {!notification.isRead && (
                          <button
                            onClick={(e) => handleMarkAsRead(notification.id, e)}
                            className="p-1 hover:bg-gray-200 rounded transition-colors flex-shrink-0"
                            title="Mark as read"
                          >
                            <Check className="w-4 h-4 text-gray-500" />
                          </button>
                        )}
                      </div>

                      {notification.body && (
                        <p className="text-sm text-gray-600 mt-0.5 line-clamp-2">
                          {notification.body}
                        </p>
                      )}

                      <p className="text-xs text-gray-400 mt-1">
                        {formatDistanceToNow(new Date(notification.createdAt), {
                          addSuffix: true,
                        })}
                      </p>

                      {notification.actionUrl && notification.actionLabel && (
                        <Link
                          href={notification.actionUrl}
                          onClick={(e) => {
                            e.stopPropagation();
                            onClose();
                          }}
                          className="text-sm text-[#52EDC7] hover:text-[#3dd4b0] font-medium mt-2 inline-block"
                        >
                          {notification.actionLabel}
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="p-3 border-t border-gray-100">
        <Link
          href="/notifications"
          onClick={onClose}
          className="block text-center text-sm text-gray-600 hover:text-gray-900 font-medium"
        >
          View all notifications
        </Link>
      </div>
    </div>
  );
}
