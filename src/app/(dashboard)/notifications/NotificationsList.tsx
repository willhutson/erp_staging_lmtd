"use client";

import { useState } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import {
  Check,
  CheckCheck,
  Archive,
  FileText,
  Clock,
  AlertCircle,
  MessageSquare,
  Trophy,
  Bell,
} from "lucide-react";
import {
  markAsRead,
  markAllAsRead,
  archiveNotification,
} from "@/modules/notifications/actions/notification-actions";
import type { NotificationRecord as Notification } from "@/types/prisma-types";

interface Props {
  initialNotifications: Notification[];
}

const typeIcons: Record<string, typeof Bell> = {
  "brief.assigned": FileText,
  "brief.status_changed": FileText,
  "brief.deadline_24h": Clock,
  "brief.deadline_overdue": AlertCircle,
  "brief.comment": MessageSquare,
  "submission.received": FileText,
  "submission.approved": Check,
  "submission.rejected": AlertCircle,
  "rfp.won": Trophy,
  default: Bell,
};

const typeColors: Record<string, string> = {
  "brief.assigned": "bg-blue-100 text-blue-600",
  "brief.deadline_overdue": "bg-red-100 text-red-600",
  "submission.approved": "bg-green-100 text-green-600",
  "submission.rejected": "bg-red-100 text-red-600",
  "rfp.won": "bg-yellow-100 text-yellow-600",
  default: "bg-gray-100 text-gray-600",
};

export function NotificationsList({ initialNotifications }: Props) {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const filteredNotifications =
    filter === "unread"
      ? notifications.filter((n) => !n.isRead)
      : notifications;

  const handleMarkAsRead = async (id: string) => {
    await markAsRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const handleArchive = async (id: string) => {
    await archiveNotification(id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const getIcon = (type: string) => {
    return typeIcons[type] || typeIcons.default;
  };

  const getIconColor = (type: string) => {
    return typeColors[type] || typeColors.default;
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="space-y-4">
      {/* Actions bar */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
              filter === "all"
                ? "bg-gray-900 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter("unread")}
            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
              filter === "unread"
                ? "bg-gray-900 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Unread ({unreadCount})
          </button>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-[#52EDC7] hover:bg-[#52EDC7]/10 rounded-lg transition-colors"
          >
            <CheckCheck className="w-4 h-4" />
            Mark all as read
          </button>
        )}
      </div>

      {/* Notifications list */}
      <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
        {filteredNotifications.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <Bell className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="font-medium">No notifications</p>
            <p className="text-sm mt-1">
              {filter === "unread"
                ? "You've read all your notifications"
                : "You don't have any notifications yet"}
            </p>
          </div>
        ) : (
          filteredNotifications.map((notification) => {
            const Icon = getIcon(notification.type);
            const iconColor = getIconColor(notification.type);

            return (
              <div
                key={notification.id}
                className={`p-4 hover:bg-gray-50 transition-colors ${
                  !notification.isRead ? "bg-blue-50/30" : ""
                }`}
              >
                <div className="flex gap-4">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${iconColor}`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p
                          className={`${
                            !notification.isRead
                              ? "font-semibold text-gray-900"
                              : "font-medium text-gray-700"
                          }`}
                        >
                          {notification.title}
                        </p>

                        {notification.body && (
                          <p className="text-sm text-gray-600 mt-0.5">
                            {notification.body}
                          </p>
                        )}

                        <p className="text-xs text-gray-400 mt-1">
                          {formatDistanceToNow(new Date(notification.createdAt), {
                            addSuffix: true,
                          })}
                        </p>

                        {notification.actionUrl && (
                          <Link
                            href={notification.actionUrl}
                            className="text-sm text-[#52EDC7] hover:text-[#3dd4b0] font-medium mt-2 inline-block"
                          >
                            {notification.actionLabel || "View"}
                          </Link>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        {!notification.isRead && (
                          <button
                            onClick={() => handleMarkAsRead(notification.id)}
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Mark as read"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleArchive(notification.id)}
                          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Archive"
                        >
                          <Archive className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
