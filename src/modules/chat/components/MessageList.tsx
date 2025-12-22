"use client";

/**
 * Message List Component
 *
 * Displays messages in a channel with:
 * - Virtual scrolling for performance
 * - Real-time updates via Pusher
 * - Reactions, threads, and message actions
 *
 * @module chat/components/MessageList
 */

import { useEffect, useRef, useState, useCallback } from "react";
import { formatDistanceToNow, format, isToday, isYesterday } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  MessageSquare,
  MoreHorizontal,
  Smile,
  Pin,
  Edit,
  Trash,
  Reply,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getPusherClient, PUSHER_EVENTS } from "@/lib/pusher";
import type { MessageWithDetails } from "../actions/message-actions";

// ============================================
// TYPES
// ============================================

interface MessageListProps {
  channelId: string;
  initialMessages: MessageWithDetails[];
  currentUserId: string;
  onReply?: (message: MessageWithDetails) => void;
  onReaction?: (messageId: string, emoji: string) => void;
  onEdit?: (messageId: string, content: string) => void;
  onDelete?: (messageId: string) => void;
  onPin?: (messageId: string) => void;
  onLoadMore?: () => Promise<MessageWithDetails[]>;
  hasMore?: boolean;
}

// ============================================
// COMMON EMOJIS
// ============================================

const QUICK_REACTIONS = ["👍", "❤️", "😂", "🎉", "🔥", "👀"];

// ============================================
// HELPERS
// ============================================

function formatMessageTime(date: Date): string {
  const d = new Date(date);

  if (isToday(d)) {
    return format(d, "h:mm a");
  }
  if (isYesterday(d)) {
    return `Yesterday at ${format(d, "h:mm a")}`;
  }
  return format(d, "MMM d, h:mm a");
}

function formatDateDivider(date: Date): string {
  const d = new Date(date);

  if (isToday(d)) {
    return "Today";
  }
  if (isYesterday(d)) {
    return "Yesterday";
  }
  return format(d, "EEEE, MMMM d, yyyy");
}

function shouldShowDateDivider(
  currentMessage: MessageWithDetails,
  previousMessage?: MessageWithDetails
): boolean {
  if (!previousMessage) return true;

  const currentDate = new Date(currentMessage.createdAt).toDateString();
  const previousDate = new Date(previousMessage.createdAt).toDateString();

  return currentDate !== previousDate;
}

// ============================================
// MESSAGE COMPONENT
// ============================================

interface MessageItemProps {
  message: MessageWithDetails;
  currentUserId: string;
  isGrouped: boolean;
  onReply?: () => void;
  onReaction?: (emoji: string) => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onPin?: () => void;
}

function MessageItem({
  message,
  currentUserId,
  isGrouped,
  onReply,
  onReaction,
  onEdit,
  onDelete,
  onPin,
}: MessageItemProps) {
  const [showActions, setShowActions] = useState(false);
  const isOwnMessage = message.user.id === currentUserId;

  // Group reactions by emoji
  const reactionGroups = message.reactions.reduce(
    (acc, reaction) => {
      if (!acc[reaction.emoji]) {
        acc[reaction.emoji] = [];
      }
      acc[reaction.emoji].push(reaction.user);
      return acc;
    },
    {} as Record<string, Array<{ id: string; name: string }>>
  );

  return (
    <div
      className={cn(
        "group flex gap-3 px-4 py-0.5 hover:bg-gray-50",
        !isGrouped && "mt-3"
      )}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Avatar */}
      <div className="w-9 flex-shrink-0">
        {!isGrouped && (
          <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center">
            {message.user.avatarUrl ? (
              <img
                src={message.user.avatarUrl}
                alt={message.user.name}
                className="w-9 h-9 rounded-full"
              />
            ) : (
              <span className="text-sm font-medium text-gray-600">
                {message.user.name.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {!isGrouped && (
          <div className="flex items-baseline gap-2">
            <span className="font-semibold text-sm">{message.user.name}</span>
            <span className="text-xs text-gray-500">
              {formatMessageTime(message.createdAt)}
            </span>
            {message.isEdited && (
              <span className="text-xs text-gray-400">(edited)</span>
            )}
          </div>
        )}

        {/* Message content */}
        {message.isDeleted ? (
          <p className="text-gray-400 italic text-sm">
            This message was deleted
          </p>
        ) : (
          <div
            className="text-sm prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: message.content }}
          />
        )}

        {/* Attachments */}
        {message.attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {message.attachments.map((attachment) => (
              <div
                key={attachment.id}
                className="border rounded-lg overflow-hidden"
              >
                {attachment.fileType.startsWith("image/") ? (
                  <img
                    src={attachment.fileUrl}
                    alt={attachment.fileName}
                    className="max-w-xs max-h-48 object-contain"
                  />
                ) : (
                  <a
                    href={attachment.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-3 hover:bg-gray-50"
                  >
                    <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
                      📎
                    </div>
                    <div>
                      <p className="text-sm font-medium">{attachment.fileName}</p>
                      <p className="text-xs text-gray-500">
                        {(attachment.fileSize / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </a>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Reactions */}
        {Object.keys(reactionGroups).length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {Object.entries(reactionGroups).map(([emoji, users]) => (
              <button
                key={emoji}
                onClick={() => onReaction?.(emoji)}
                className={cn(
                  "flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border",
                  users.some((u) => u.id === currentUserId)
                    ? "bg-blue-50 border-blue-200"
                    : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                )}
                title={users.map((u) => u.name).join(", ")}
              >
                <span>{emoji}</span>
                <span>{users.length}</span>
              </button>
            ))}
          </div>
        )}

        {/* Thread indicator */}
        {message.replyCount > 0 && (
          <button
            onClick={onReply}
            className="flex items-center gap-1 mt-1 text-xs text-blue-600 hover:underline"
          >
            <MessageSquare className="h-3 w-3" />
            {message.replyCount} {message.replyCount === 1 ? "reply" : "replies"}
          </button>
        )}
      </div>

      {/* Actions */}
      {showActions && !message.isDeleted && (
        <div className="flex items-start gap-1">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <Smile className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-2" align="end">
              <div className="flex gap-1">
                {QUICK_REACTIONS.map((emoji) => (
                  <button
                    key={emoji}
                    className="p-1 hover:bg-gray-100 rounded text-lg"
                    onClick={() => onReaction?.(emoji)}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onReply}>
            <Reply className="h-4 w-4" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onPin}>
                <Pin className="h-4 w-4 mr-2" />
                Pin message
              </DropdownMenuItem>
              {isOwnMessage && (
                <>
                  <DropdownMenuItem onClick={onEdit}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit message
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={onDelete}
                    className="text-red-600"
                  >
                    <Trash className="h-4 w-4 mr-2" />
                    Delete message
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </div>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

export function MessageList({
  channelId,
  initialMessages,
  currentUserId,
  onReply,
  onReaction,
  onEdit,
  onDelete,
  onPin,
  onLoadMore,
  hasMore = false,
}: MessageListProps) {
  const [messages, setMessages] = useState<MessageWithDetails[]>(initialMessages);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom on new messages
  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // Subscribe to real-time updates
  useEffect(() => {
    const pusher = getPusherClient();
    const channel = pusher.subscribe(`channel-${channelId}`);

    // New message
    channel.bind(PUSHER_EVENTS.MESSAGE_SENT, (data: { message: MessageWithDetails }) => {
      setMessages((prev) => [...prev, data.message]);
      scrollToBottom();
    });

    // Message edited
    channel.bind(PUSHER_EVENTS.MESSAGE_EDITED, (data: { message: MessageWithDetails }) => {
      setMessages((prev) =>
        prev.map((m) => (m.id === data.message.id ? data.message : m))
      );
    });

    // Message deleted
    channel.bind(PUSHER_EVENTS.MESSAGE_DELETED, (data: { messageId: string }) => {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === data.messageId
            ? { ...m, isDeleted: true, content: "[Message deleted]" }
            : m
        )
      );
    });

    // Reaction added
    channel.bind(
      PUSHER_EVENTS.REACTION_ADDED,
      (data: { messageId: string; reaction: any }) => {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === data.messageId
              ? { ...m, reactions: [...m.reactions, data.reaction] }
              : m
          )
        );
      }
    );

    // Reaction removed
    channel.bind(
      PUSHER_EVENTS.REACTION_REMOVED,
      (data: { messageId: string; emoji: string; userId: string }) => {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === data.messageId
              ? {
                  ...m,
                  reactions: m.reactions.filter(
                    (r) => !(r.emoji === data.emoji && r.userId === data.userId)
                  ),
                }
              : m
          )
        );
      }
    );

    return () => {
      channel.unbind_all();
      pusher.unsubscribe(`channel-${channelId}`);
    };
  }, [channelId, scrollToBottom]);

  // Update messages when initialMessages change
  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);

  // Scroll to bottom on initial load
  useEffect(() => {
    scrollToBottom();
  }, [scrollToBottom]);

  // Load more messages
  const handleLoadMore = async () => {
    if (!onLoadMore || isLoadingMore) return;

    setIsLoadingMore(true);
    try {
      const olderMessages = await onLoadMore();
      setMessages((prev) => [...olderMessages, ...prev]);
    } finally {
      setIsLoadingMore(false);
    }
  };

  // Check if messages should be grouped (same user within 5 minutes)
  const shouldGroupMessage = (
    current: MessageWithDetails,
    previous?: MessageWithDetails
  ): boolean => {
    if (!previous) return false;
    if (current.user.id !== previous.user.id) return false;

    const timeDiff =
      new Date(current.createdAt).getTime() -
      new Date(previous.createdAt).getTime();

    return timeDiff < 5 * 60 * 1000; // 5 minutes
  };

  return (
    <div ref={scrollContainerRef} className="flex-1 overflow-y-auto">
      {/* Load more button */}
      {hasMore && (
        <div className="flex justify-center py-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleLoadMore}
            disabled={isLoadingMore}
          >
            {isLoadingMore ? "Loading..." : "Load older messages"}
          </Button>
        </div>
      )}

      {/* Messages */}
      {messages.map((message, index) => {
        const previousMessage = messages[index - 1];
        const showDateDivider = shouldShowDateDivider(message, previousMessage);
        const isGrouped =
          !showDateDivider && shouldGroupMessage(message, previousMessage);

        return (
          <div key={message.id}>
            {showDateDivider && (
              <div className="flex items-center justify-center my-4">
                <div className="border-t flex-1" />
                <span className="px-4 text-xs text-gray-500 font-medium">
                  {formatDateDivider(message.createdAt)}
                </span>
                <div className="border-t flex-1" />
              </div>
            )}
            <MessageItem
              message={message}
              currentUserId={currentUserId}
              isGrouped={isGrouped}
              onReply={() => onReply?.(message)}
              onReaction={(emoji) => onReaction?.(message.id, emoji)}
              onEdit={() => onEdit?.(message.id, message.content)}
              onDelete={() => onDelete?.(message.id)}
              onPin={() => onPin?.(message.id)}
            />
          </div>
        );
      })}

      {/* Empty state */}
      {messages.length === 0 && (
        <div className="flex flex-col items-center justify-center h-full text-gray-500">
          <MessageSquare className="h-12 w-12 mb-4" />
          <p className="text-lg font-medium">No messages yet</p>
          <p className="text-sm">Be the first to send a message!</p>
        </div>
      )}

      {/* Scroll anchor */}
      <div ref={bottomRef} />
    </div>
  );
}
