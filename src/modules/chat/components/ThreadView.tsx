"use client";

/**
 * Thread View Component
 *
 * Displays a thread conversation as a slide-out panel.
 * Shows parent message and all replies with real-time updates.
 *
 * @module chat/components/ThreadView
 */

import { useEffect, useState, useCallback } from "react";
import { formatDistanceToNow, format, isToday, isYesterday } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { X, Smile, Send, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { getPusherClient, PUSHER_EVENTS } from "@/lib/pusher";
import { RichTextEditor, type RichTextEditorRef } from "@/components/editor";
import {
  getThreadReplies,
  sendMessage,
  toggleReaction,
  type MessageWithDetails,
  type SendMessageInput,
} from "../actions/message-actions";
import { useRef } from "react";

// ============================================
// TYPES
// ============================================

interface ThreadViewProps {
  open: boolean;
  onClose: () => void;
  parentMessage: MessageWithDetails;
  channelId: string;
  organizationId: string;
  currentUserId: string;
  users?: Array<{ id: string; name: string; avatarUrl?: string | null }>;
}

// ============================================
// QUICK REACTIONS
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

// ============================================
// THREAD MESSAGE COMPONENT
// ============================================

interface ThreadMessageProps {
  message: MessageWithDetails;
  currentUserId: string;
  isParent?: boolean;
  onReaction?: (emoji: string) => void;
}

function ThreadMessage({
  message,
  currentUserId,
  isParent = false,
  onReaction,
}: ThreadMessageProps) {
  const [showActions, setShowActions] = useState(false);

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
        "group flex gap-3 py-2 hover:bg-gray-50 rounded-lg px-2",
        isParent && "bg-gray-50 border-l-4 border-blue-500"
      )}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Avatar */}
      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
        {message.user.avatarUrl ? (
          <img
            src={message.user.avatarUrl}
            alt={message.user.name}
            className="w-8 h-8 rounded-full"
          />
        ) : (
          <span className="text-xs font-medium text-gray-600">
            {message.user.name.charAt(0).toUpperCase()}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <span className="font-semibold text-sm">{message.user.name}</span>
          <span className="text-xs text-gray-500">
            {formatMessageTime(message.createdAt)}
          </span>
          {message.isEdited && (
            <span className="text-xs text-gray-400">(edited)</span>
          )}
        </div>

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
      </div>

      {/* Quick reactions */}
      {showActions && !message.isDeleted && (
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="h-6 w-6">
              <Smile className="h-3 w-3" />
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
      )}
    </div>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

export function ThreadView({
  open,
  onClose,
  parentMessage,
  channelId,
  organizationId,
  currentUserId,
  users = [],
}: ThreadViewProps) {
  const [replies, setReplies] = useState<MessageWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const editorRef = useRef<RichTextEditorRef>(null);

  // Load thread replies
  const loadReplies = useCallback(async () => {
    if (!parentMessage.id) return;

    setIsLoading(true);
    try {
      const result = await getThreadReplies(parentMessage.id);
      setReplies(result.messages);
    } catch (error) {
      console.error("Failed to load thread replies:", error);
    } finally {
      setIsLoading(false);
    }
  }, [parentMessage.id]);

  // Load replies when opening
  useEffect(() => {
    if (open) {
      loadReplies();
    }
  }, [open, loadReplies]);

  // Subscribe to real-time updates for this thread
  useEffect(() => {
    if (!open) return;

    const pusher = getPusherClient();
    const channel = pusher.subscribe(`channel-${channelId}`);

    // New message - check if it's a reply to our thread
    channel.bind(PUSHER_EVENTS.MESSAGE_SENT, (data: { message: MessageWithDetails }) => {
      if (data.message.parentId === parentMessage.id) {
        setReplies((prev) => [...prev, data.message]);
      }
    });

    // Reaction updates
    channel.bind(
      PUSHER_EVENTS.REACTION_ADDED,
      (data: { messageId: string; reaction: any }) => {
        setReplies((prev) =>
          prev.map((m) =>
            m.id === data.messageId
              ? { ...m, reactions: [...m.reactions, data.reaction] }
              : m
          )
        );
      }
    );

    channel.bind(
      PUSHER_EVENTS.REACTION_REMOVED,
      (data: { messageId: string; emoji: string; userId: string }) => {
        setReplies((prev) =>
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
  }, [open, channelId, parentMessage.id]);

  // Send reply
  const handleSendReply = async () => {
    const content = editorRef.current?.getHTML();
    if (!content || content === "<p></p>") return;

    setIsSending(true);
    try {
      await sendMessage({
        organizationId,
        channelId,
        userId: currentUserId,
        content,
        parentId: parentMessage.id,
      });
      editorRef.current?.clear();
    } catch (error) {
      console.error("Failed to send reply:", error);
    } finally {
      setIsSending(false);
    }
  };

  // Handle reaction
  const handleReaction = async (messageId: string, emoji: string) => {
    try {
      await toggleReaction(messageId, currentUserId, emoji);
    } catch (error) {
      console.error("Failed to toggle reaction:", error);
    }
  };

  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <SheetContent className="w-full sm:max-w-md p-0 flex flex-col">
        {/* Header */}
        <SheetHeader className="px-4 py-3 border-b flex-shrink-0">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-base">Thread</SheetTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-gray-500">
            {parentMessage.replyCount} {parentMessage.replyCount === 1 ? "reply" : "replies"}
          </p>
        </SheetHeader>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {/* Parent message */}
          <ThreadMessage
            message={parentMessage}
            currentUserId={currentUserId}
            isParent
            onReaction={(emoji) => handleReaction(parentMessage.id, emoji)}
          />

          {/* Divider */}
          {replies.length > 0 && (
            <div className="border-t my-4">
              <span className="text-xs text-gray-500 bg-white px-2 relative -top-2.5 left-4">
                {replies.length} {replies.length === 1 ? "reply" : "replies"}
              </span>
            </div>
          )}

          {/* Loading state */}
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            </div>
          )}

          {/* Replies */}
          {!isLoading &&
            replies.map((reply) => (
              <ThreadMessage
                key={reply.id}
                message={reply}
                currentUserId={currentUserId}
                onReaction={(emoji) => handleReaction(reply.id, emoji)}
              />
            ))}
        </div>

        {/* Reply composer */}
        <div className="border-t p-4 flex-shrink-0">
          <div className="flex gap-2">
            <div className="flex-1">
              <RichTextEditor
                ref={editorRef}
                variant="minimal"
                placeholder="Reply in thread..."
                users={users.map((u) => ({
                  id: u.id,
                  name: u.name,
                  avatarUrl: u.avatarUrl,
                }))}
                className="max-h-32 overflow-y-auto"
              />
            </div>
            <Button
              onClick={handleSendReply}
              disabled={isSending}
              size="icon"
              className="self-end"
            >
              {isSending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
