"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";
import { Button } from "./button";
import { Badge } from "./badge";
import {
  MessageSquare,
  MoreHorizontal,
  Smile,
  Reply,
  Pin,
  Bookmark,
  ExternalLink,
  FileText,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Link as LinkIcon,
  Users,
  X,
} from "lucide-react";

// Helper for initials
function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

// Status indicator colors
function getStatusColor(status: "online" | "away" | "busy" | "offline") {
  const colors = {
    online: "bg-emerald-500",
    away: "bg-amber-500",
    busy: "bg-red-500",
    offline: "bg-gray-400",
  };
  return colors[status] || colors.offline;
}

// Message Component
interface MessageProps {
  id: string;
  user: {
    name: string;
    avatar?: string;
    status?: "online" | "away" | "busy" | "offline";
  };
  content: string;
  timestamp: string;
  reactions?: Array<{ emoji: string; count: number; reacted?: boolean }>;
  threadCount?: number;
  isPinned?: boolean;
  isBookmarked?: boolean;
  linkedItem?: {
    type: "brief" | "calendar" | "document";
    title: string;
    href: string;
  };
  onReply?: () => void;
  onReact?: (emoji: string) => void;
  onPin?: () => void;
  onBookmark?: () => void;
  className?: string;
}

export function Message({
  id,
  user,
  content,
  timestamp,
  reactions = [],
  threadCount,
  isPinned,
  isBookmarked,
  linkedItem,
  onReply,
  onReact,
  onPin,
  onBookmark,
  className,
}: MessageProps) {
  return (
    <div className={cn("flex gap-3 group py-2 px-2 -mx-2 rounded-lg hover:bg-muted/50 transition-colors", className)}>
      <div className="relative shrink-0">
        <Avatar className="h-9 w-9">
          <AvatarImage src={user.avatar} />
          <AvatarFallback className="bg-primary/10 text-sm">
            {getInitials(user.name)}
          </AvatarFallback>
        </Avatar>
        {user.status && (
          <div
            className={cn(
              "absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-background",
              getStatusColor(user.status)
            )}
          />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-sm">{user.name}</span>
          <span className="text-xs text-muted-foreground">{timestamp}</span>
          {isPinned && (
            <Badge variant="secondary" className="text-[10px] gap-1">
              <Pin className="h-2.5 w-2.5" />
              Pinned
            </Badge>
          )}
        </div>

        <p className="text-sm mt-0.5 whitespace-pre-wrap">{content}</p>

        {/* Linked Item */}
        {linkedItem && (
          <a
            href={linkedItem.href}
            className="mt-2 inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors text-sm group/link"
          >
            <div className="p-1.5 rounded bg-primary/10">
              {linkedItem.type === "brief" && <FileText className="h-3.5 w-3.5 text-primary" />}
              {linkedItem.type === "calendar" && <Calendar className="h-3.5 w-3.5 text-primary" />}
              {linkedItem.type === "document" && <FileText className="h-3.5 w-3.5 text-primary" />}
            </div>
            <span className="font-medium">{linkedItem.title}</span>
            <ExternalLink className="h-3 w-3 text-muted-foreground group-hover/link:text-primary transition-colors" />
          </a>
        )}

        {/* Reactions */}
        {reactions.length > 0 && (
          <div className="flex gap-1 mt-2 flex-wrap">
            {reactions.map((reaction, idx) => (
              <button
                key={idx}
                onClick={() => onReact?.(reaction.emoji)}
                className={cn(
                  "flex items-center gap-1 px-2 py-0.5 rounded-full text-xs transition-colors",
                  reaction.reacted
                    ? "bg-primary/20 border border-primary/30"
                    : "bg-muted hover:bg-muted/80"
                )}
              >
                <span>{reaction.emoji}</span>
                <span className="font-medium">{reaction.count}</span>
              </button>
            ))}
          </div>
        )}

        {/* Thread indicator */}
        {threadCount && threadCount > 0 && (
          <button
            onClick={onReply}
            className="mt-2 flex items-center gap-2 text-xs text-primary hover:underline"
          >
            <MessageSquare className="h-3.5 w-3.5" />
            {threadCount} {threadCount === 1 ? "reply" : "replies"}
          </button>
        )}
      </div>

      {/* Action buttons */}
      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-start gap-0.5 shrink-0">
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onReact?.("👍")}>
          <Smile className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onReply}>
          <Reply className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onBookmark}>
          <Bookmark className={cn("h-4 w-4", isBookmarked && "fill-current text-primary")} />
        </Button>
        <Button variant="ghost" size="icon" className="h-7 w-7">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

// Thread Panel for side-panel view
interface ThreadPanelProps {
  parentMessage: MessageProps;
  replies: Array<Omit<MessageProps, "threadCount" | "linkedItem">>;
  onClose: () => void;
  className?: string;
}

export function ThreadPanel({
  parentMessage,
  replies,
  onClose,
  className,
}: ThreadPanelProps) {
  const [replyText, setReplyText] = React.useState("");

  return (
    <div className={cn("flex flex-col h-full border-l bg-card", className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-primary" />
          <span className="font-semibold">Thread</span>
          <Badge variant="secondary" className="text-xs">
            {replies.length} {replies.length === 1 ? "reply" : "replies"}
          </Badge>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Parent message */}
      <div className="p-4 border-b bg-muted/30">
        <Message {...parentMessage} threadCount={undefined} />
      </div>

      {/* Replies */}
      <div className="flex-1 overflow-auto p-4 space-y-2">
        {replies.map((reply) => (
          <Message key={reply.id} {...reply} />
        ))}
      </div>

      {/* Reply input */}
      <div className="p-4 border-t">
        <div className="flex items-center gap-2 bg-muted rounded-lg p-2">
          <input
            type="text"
            placeholder="Reply to thread..."
            className="flex-1 bg-transparent border-0 focus:outline-none text-sm"
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
          />
          <Button size="sm" disabled={!replyText.trim()}>
            Reply
          </Button>
        </div>
      </div>
    </div>
  );
}

// Item-Linked Thread Component (for brief/calendar attached discussions)
interface ItemLinkedThreadProps {
  item: {
    type: "brief" | "calendar" | "document" | "task";
    id: string;
    title: string;
    status?: "pending" | "in_progress" | "completed" | "overdue";
    client?: string;
    dueDate?: string;
  };
  messageCount: number;
  lastMessage?: {
    user: string;
    preview: string;
    time: string;
  };
  participants: Array<{ name: string; avatar?: string }>;
  onClick?: () => void;
  className?: string;
}

export function ItemLinkedThread({
  item,
  messageCount,
  lastMessage,
  participants,
  onClick,
  className,
}: ItemLinkedThreadProps) {
  const statusConfig = {
    pending: { icon: Clock, color: "text-amber-500", bg: "bg-amber-500/10" },
    in_progress: { icon: Clock, color: "text-blue-500", bg: "bg-blue-500/10" },
    completed: { icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    overdue: { icon: AlertCircle, color: "text-red-500", bg: "bg-red-500/10" },
  };

  const status = item.status ? statusConfig[item.status] : null;
  const StatusIcon = status?.icon;

  const itemTypeIcons = {
    brief: FileText,
    calendar: Calendar,
    document: FileText,
    task: CheckCircle2,
  };
  const ItemIcon = itemTypeIcons[item.type];

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left p-4 rounded-xl border bg-card hover:bg-muted/50 transition-colors group",
        className
      )}
    >
      <div className="flex items-start gap-3">
        {/* Item icon */}
        <div className={cn("p-2 rounded-lg", status?.bg || "bg-muted")}>
          <ItemIcon className={cn("h-5 w-5", status?.color || "text-muted-foreground")} />
        </div>

        <div className="flex-1 min-w-0">
          {/* Item info */}
          <div className="flex items-center gap-2">
            <span className="font-semibold truncate">{item.title}</span>
            {item.status && StatusIcon && (
              <StatusIcon className={cn("h-4 w-4 shrink-0", status?.color)} />
            )}
          </div>

          {(item.client || item.dueDate) && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
              {item.client && <span>{item.client}</span>}
              {item.client && item.dueDate && <span>•</span>}
              {item.dueDate && <span>{item.dueDate}</span>}
            </div>
          )}

          {/* Last message preview */}
          {lastMessage && (
            <div className="mt-2 p-2 rounded-lg bg-muted/50">
              <div className="flex items-center gap-1 text-xs">
                <span className="font-medium">{lastMessage.user}</span>
                <span className="text-muted-foreground">• {lastMessage.time}</span>
              </div>
              <p className="text-sm text-muted-foreground truncate mt-0.5">
                {lastMessage.preview}
              </p>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {participants.slice(0, 4).map((p, i) => (
                  <Avatar key={i} className="h-6 w-6 border-2 border-background">
                    <AvatarImage src={p.avatar} />
                    <AvatarFallback className="text-[10px] bg-primary/10">
                      {getInitials(p.name)}
                    </AvatarFallback>
                  </Avatar>
                ))}
                {participants.length > 4 && (
                  <div className="h-6 w-6 rounded-full bg-muted border-2 border-background flex items-center justify-center text-[10px] font-medium">
                    +{participants.length - 4}
                  </div>
                )}
              </div>
              <span className="text-xs text-muted-foreground">
                {participants.length} participants
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <MessageSquare className="h-3.5 w-3.5" />
              {messageCount}
            </div>
          </div>
        </div>

        <LinkIcon className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
      </div>
    </button>
  );
}

// Typing Indicator
interface TypingIndicatorProps {
  users: string[];
  className?: string;
}

export function TypingIndicator({ users, className }: TypingIndicatorProps) {
  if (users.length === 0) return null;

  const displayText = () => {
    if (users.length === 1) return `${users[0]} is typing`;
    if (users.length === 2) return `${users[0]} and ${users[1]} are typing`;
    return `${users[0]} and ${users.length - 1} others are typing`;
  };

  return (
    <div className={cn("flex items-center gap-2 text-sm text-muted-foreground", className)}>
      <div className="flex gap-0.5">
        <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "0ms" }} />
        <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "150ms" }} />
        <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "300ms" }} />
      </div>
      <span>{displayText()}</span>
    </div>
  );
}

// Presence Indicator Row
interface PresenceRowProps {
  users: Array<{
    name: string;
    avatar?: string;
    status: "online" | "away" | "busy" | "offline";
  }>;
  maxVisible?: number;
  className?: string;
}

export function PresenceRow({ users, maxVisible = 8, className }: PresenceRowProps) {
  const onlineUsers = users.filter((u) => u.status === "online");
  const awayUsers = users.filter((u) => u.status === "away");

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="flex -space-x-2">
        {users.slice(0, maxVisible).map((user, i) => (
          <div key={i} className="relative">
            <Avatar className="h-8 w-8 border-2 border-background">
              <AvatarImage src={user.avatar} />
              <AvatarFallback className="text-xs bg-primary/10">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
            <div
              className={cn(
                "absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-background",
                getStatusColor(user.status)
              )}
            />
          </div>
        ))}
        {users.length > maxVisible && (
          <div className="h-8 w-8 rounded-full bg-muted border-2 border-background flex items-center justify-center text-xs font-medium">
            +{users.length - maxVisible}
          </div>
        )}
      </div>
      <div className="text-sm text-muted-foreground">
        <span className="text-emerald-500 font-medium">{onlineUsers.length} online</span>
        {awayUsers.length > 0 && (
          <span> • {awayUsers.length} away</span>
        )}
      </div>
    </div>
  );
}
