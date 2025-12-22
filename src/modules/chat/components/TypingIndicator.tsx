"use client";

/**
 * Typing Indicator Component
 *
 * Shows who is currently typing in a channel with animated dots.
 * Subscribes to real-time typing events.
 *
 * @module chat/components/TypingIndicator
 */

import { useEffect, useState, useCallback } from "react";
import { getPusherClient, PUSHER_EVENTS, type UserTypingEvent } from "@/lib/pusher";
import { cn } from "@/lib/utils";

// ============================================
// TYPES
// ============================================

interface TypingUser {
  id: string;
  name: string;
  lastTypingAt: number;
}

interface TypingIndicatorProps {
  channelId: string;
  currentUserId: string;
  className?: string;
}

// ============================================
// CONSTANTS
// ============================================

const TYPING_TIMEOUT = 3000; // Clear after 3 seconds of no typing

// ============================================
// ANIMATED DOTS COMPONENT
// ============================================

function AnimatedDots() {
  return (
    <span className="inline-flex items-center gap-0.5 ml-1">
      <span className="w-1 h-1 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
      <span className="w-1 h-1 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
      <span className="w-1 h-1 bg-gray-500 rounded-full animate-bounce" />
    </span>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

export function TypingIndicator({
  channelId,
  currentUserId,
  className,
}: TypingIndicatorProps) {
  const [typingUsers, setTypingUsers] = useState<Map<string, TypingUser>>(new Map());

  // Clean up stale typing indicators
  const cleanupStaleTypers = useCallback(() => {
    const now = Date.now();
    setTypingUsers((prev) => {
      const updated = new Map(prev);
      let changed = false;

      for (const [userId, user] of updated) {
        if (now - user.lastTypingAt > TYPING_TIMEOUT) {
          updated.delete(userId);
          changed = true;
        }
      }

      return changed ? updated : prev;
    });
  }, []);

  // Subscribe to typing events
  useEffect(() => {
    const pusher = getPusherClient();
    const channel = pusher.subscribe(`channel-${channelId}`);

    // User started typing
    channel.bind(PUSHER_EVENTS.USER_TYPING, (data: UserTypingEvent) => {
      // Don't show current user's typing
      if (data.user.id === currentUserId) return;

      setTypingUsers((prev) => {
        const updated = new Map(prev);
        updated.set(data.user.id, {
          id: data.user.id,
          name: data.user.name,
          lastTypingAt: Date.now(),
        });
        return updated;
      });
    });

    // User stopped typing
    channel.bind(PUSHER_EVENTS.USER_STOP_TYPING, (data: { userId: string }) => {
      setTypingUsers((prev) => {
        const updated = new Map(prev);
        updated.delete(data.userId);
        return updated;
      });
    });

    // Cleanup timer
    const cleanupInterval = setInterval(cleanupStaleTypers, 1000);

    return () => {
      channel.unbind_all();
      pusher.unsubscribe(`channel-${channelId}`);
      clearInterval(cleanupInterval);
    };
  }, [channelId, currentUserId, cleanupStaleTypers]);

  // Get typing users list (excluding current user)
  const typingUsersList = Array.from(typingUsers.values());

  if (typingUsersList.length === 0) {
    return null;
  }

  // Format typing message
  const getTypingMessage = () => {
    const names = typingUsersList.map((u) => u.name);

    if (names.length === 1) {
      return (
        <>
          <span className="font-medium">{names[0]}</span> is typing
        </>
      );
    }

    if (names.length === 2) {
      return (
        <>
          <span className="font-medium">{names[0]}</span> and{" "}
          <span className="font-medium">{names[1]}</span> are typing
        </>
      );
    }

    if (names.length === 3) {
      return (
        <>
          <span className="font-medium">{names[0]}</span>,{" "}
          <span className="font-medium">{names[1]}</span>, and{" "}
          <span className="font-medium">{names[2]}</span> are typing
        </>
      );
    }

    return (
      <>
        <span className="font-medium">{names.length}</span> people are typing
      </>
    );
  };

  return (
    <div className={cn("flex items-center text-sm text-gray-500 h-6", className)}>
      {getTypingMessage()}
      <AnimatedDots />
    </div>
  );
}

// ============================================
// TYPING HOOK (for editors to use)
// ============================================

interface UseTypingOptions {
  channelId: string;
  userId: string;
  userName: string;
  debounceMs?: number;
}

export function useTyping({
  channelId,
  userId,
  userName,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  debounceMs = 500,
}: UseTypingOptions) {
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);

  // Send typing indicator
  const sendTyping = useCallback(async () => {
    try {
      // getPusherClient() available for client events if needed
      await fetch("/api/chat/typing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channelId,
          user: { id: userId, name: userName },
        }),
      });
    } catch {
      // Silent fail for typing indicators
    }
  }, [channelId, userId, userName]);

  // Send stop typing
  const sendStopTyping = useCallback(async () => {
    try {
      await fetch("/api/chat/stop-typing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channelId,
          userId,
        }),
      });
    } catch {
      // Silent fail
    }
  }, [channelId, userId]);

  // Handle typing (call this on input change)
  const handleTyping = useCallback(() => {
    if (!isTyping) {
      setIsTyping(true);
      sendTyping();
    }

    // Clear existing timeout
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }

    // Set new timeout to stop typing
    const timeout = setTimeout(() => {
      setIsTyping(false);
      sendStopTyping();
    }, 2000);

    setTypingTimeout(timeout);
  }, [isTyping, typingTimeout, sendTyping, sendStopTyping]);

  // Stop typing on unmount or message send
  const stopTyping = useCallback(() => {
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }
    setIsTyping(false);
    sendStopTyping();
  }, [typingTimeout, sendStopTyping]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }
    };
  }, [typingTimeout]);

  return {
    isTyping,
    handleTyping,
    stopTyping,
  };
}
