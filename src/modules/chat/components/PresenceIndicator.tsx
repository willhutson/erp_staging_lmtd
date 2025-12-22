"use client";

/**
 * Presence Indicator Component
 *
 * Shows user online/away/offline status with a colored dot.
 * Subscribes to real-time presence updates.
 *
 * @module chat/components/PresenceIndicator
 */

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { getPusherClient, PUSHER_EVENTS, type PresenceChangedEvent } from "@/lib/pusher";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatDistanceToNow } from "date-fns";

// ============================================
// TYPES
// ============================================

type PresenceStatus = "ONLINE" | "AWAY" | "DND" | "OFFLINE";

interface PresenceIndicatorProps {
  userId: string;
  initialStatus?: PresenceStatus;
  statusText?: string | null;
  statusEmoji?: string | null;
  lastSeenAt?: Date | null;
  size?: "sm" | "md" | "lg";
  showTooltip?: boolean;
  className?: string;
}

// ============================================
// STATUS COLORS
// ============================================

const STATUS_COLORS: Record<PresenceStatus, string> = {
  ONLINE: "bg-green-500",
  AWAY: "bg-yellow-500",
  DND: "bg-red-500",
  OFFLINE: "bg-gray-400",
};

const STATUS_LABELS: Record<PresenceStatus, string> = {
  ONLINE: "Online",
  AWAY: "Away",
  DND: "Do Not Disturb",
  OFFLINE: "Offline",
};

const SIZE_CLASSES = {
  sm: "w-2 h-2",
  md: "w-2.5 h-2.5",
  lg: "w-3 h-3",
};

// ============================================
// MAIN COMPONENT
// ============================================

export function PresenceIndicator({
  userId,
  initialStatus = "OFFLINE",
  statusText: initialStatusText,
  statusEmoji: initialStatusEmoji,
  lastSeenAt: initialLastSeenAt,
  size = "md",
  showTooltip = true,
  className,
}: PresenceIndicatorProps) {
  const [status, setStatus] = useState<PresenceStatus>(initialStatus);
  const [statusText, setStatusText] = useState<string | null | undefined>(initialStatusText);
  const [statusEmoji, setStatusEmoji] = useState<string | null | undefined>(initialStatusEmoji);
  const [lastSeenAt, setLastSeenAt] = useState<Date | null | undefined>(initialLastSeenAt);

  // Subscribe to presence updates
  useEffect(() => {
    const pusher = getPusherClient();
    const channel = pusher.subscribe("presence-global");

    channel.bind(PUSHER_EVENTS.PRESENCE_CHANGED, (data: PresenceChangedEvent) => {
      if (data.userId === userId) {
        setStatus(data.status);
        setStatusText(data.statusText);
        setStatusEmoji(data.statusEmoji);
        setLastSeenAt(new Date(data.lastSeenAt));
      }
    });

    return () => {
      channel.unbind(PUSHER_EVENTS.PRESENCE_CHANGED);
      pusher.unsubscribe("presence-global");
    };
  }, [userId]);

  // Build tooltip content
  const getTooltipContent = () => {
    const parts: string[] = [];

    // Status emoji + text
    if (statusEmoji || statusText) {
      parts.push(`${statusEmoji || ""} ${statusText || ""}`.trim());
    }

    // Status label
    parts.push(STATUS_LABELS[status]);

    // Last seen (for offline users)
    if (status === "OFFLINE" && lastSeenAt) {
      parts.push(`Last seen ${formatDistanceToNow(lastSeenAt, { addSuffix: true })}`);
    }

    return parts;
  };

  const indicator = (
    <span
      className={cn(
        "inline-block rounded-full",
        STATUS_COLORS[status],
        SIZE_CLASSES[size],
        className
      )}
    />
  );

  if (!showTooltip) {
    return indicator;
  }

  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          {indicator}
        </TooltipTrigger>
        <TooltipContent side="top" className="text-xs">
          {getTooltipContent().map((line, i) => (
            <div key={i}>{line}</div>
          ))}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// ============================================
// AVATAR WITH PRESENCE
// ============================================

interface AvatarWithPresenceProps {
  userId: string;
  name: string;
  avatarUrl?: string | null;
  initialStatus?: PresenceStatus;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const AVATAR_SIZES = {
  sm: "w-8 h-8",
  md: "w-10 h-10",
  lg: "w-12 h-12",
};

const AVATAR_TEXT_SIZES = {
  sm: "text-xs",
  md: "text-sm",
  lg: "text-base",
};

export function AvatarWithPresence({
  userId,
  name,
  avatarUrl,
  initialStatus = "OFFLINE",
  size = "md",
  className,
}: AvatarWithPresenceProps) {
  return (
    <div className={cn("relative inline-block", className)}>
      <div
        className={cn(
          "rounded-full bg-gray-200 flex items-center justify-center overflow-hidden",
          AVATAR_SIZES[size]
        )}
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={name}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className={cn("font-medium text-gray-600", AVATAR_TEXT_SIZES[size])}>
            {name.charAt(0).toUpperCase()}
          </span>
        )}
      </div>
      <span className="absolute bottom-0 right-0 transform translate-x-0.5 translate-y-0.5">
        <PresenceIndicator
          userId={userId}
          initialStatus={initialStatus}
          size={size === "lg" ? "md" : "sm"}
        />
      </span>
    </div>
  );
}

// ============================================
// PRESENCE BADGE (for lists)
// ============================================

interface PresenceBadgeProps {
  status: PresenceStatus;
  className?: string;
}

export function PresenceBadge({ status, className }: PresenceBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
        status === "ONLINE" && "bg-green-100 text-green-800",
        status === "AWAY" && "bg-yellow-100 text-yellow-800",
        status === "DND" && "bg-red-100 text-red-800",
        status === "OFFLINE" && "bg-gray-100 text-gray-600",
        className
      )}
    >
      <span
        className={cn(
          "w-1.5 h-1.5 rounded-full mr-1.5",
          STATUS_COLORS[status]
        )}
      />
      {STATUS_LABELS[status]}
    </span>
  );
}
