"use client";

/**
 * Channel View Client Component
 *
 * Interactive channel view with messages and editor.
 *
 * @module app/(dashboard)/chat/[slug]/ChannelViewClient
 */

import { useState, useCallback } from "react";
import {
  Hash,
  Lock,
  Users,
  Pin,
  Settings,
  Bell,
  BellOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { MessageList } from "@/modules/chat/components/MessageList";
import { MessageEditor } from "@/modules/chat/components/MessageEditor";
import {
  sendMessage,
  toggleReaction,
  deleteMessage,
  pinMessage,
  sendTypingIndicator,
  sendStopTypingIndicator,
} from "@/modules/chat/actions/message-actions";
import type { ChannelType, ChannelMemberRole } from "@prisma/client";
import type { MessageWithDetails } from "@/modules/chat/actions/message-actions";

// ============================================
// TYPES
// ============================================

interface Channel {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  type: ChannelType;
  icon: string | null;
  _count: {
    members: number;
  };
}

interface Member {
  id: string;
  userId: string;
  role: ChannelMemberRole;
  user: {
    id: string;
    name: string;
    avatarUrl: string | null;
    department?: string;
    role?: string;
  };
}

interface User {
  id: string;
  name: string;
  avatarUrl: string | null;
}

interface ChannelViewClientProps {
  channel: Channel;
  initialMessages: MessageWithDetails[];
  hasMore: boolean;
  members: Member[];
  users: User[];
  currentUserId: string;
  organizationId: string;
}

// ============================================
// COMPONENT
// ============================================

export function ChannelViewClient({
  channel,
  initialMessages,
  hasMore,
  members,
  users,
  currentUserId,
  organizationId,
}: ChannelViewClientProps) {
  const [replyingTo, setReplyingTo] = useState<{
    id: string;
    userName: string;
    preview: string;
  } | null>(null);
  const [showMembers, setShowMembers] = useState(false);

  // Handle send message
  const handleSendMessage = useCallback(
    async (content: string, mentionedUserIds: string[]) => {
      await sendMessage({
        organizationId,
        channelId: channel.id,
        userId: currentUserId,
        content,
        mentionedUserIds,
        parentId: replyingTo?.id,
      });
      setReplyingTo(null);
    },
    [organizationId, channel.id, currentUserId, replyingTo]
  );

  // Handle typing indicator
  const handleTyping = useCallback(() => {
    sendTypingIndicator(channel.id, {
      id: currentUserId,
      name: users.find((u) => u.id === currentUserId)?.name || "Unknown",
    });
  }, [channel.id, currentUserId, users]);

  const handleStopTyping = useCallback(() => {
    sendStopTypingIndicator(channel.id, currentUserId);
  }, [channel.id, currentUserId]);

  // Handle reaction
  const handleReaction = useCallback(
    async (messageId: string, emoji: string) => {
      await toggleReaction(messageId, currentUserId, emoji);
    },
    [currentUserId]
  );

  // Handle reply
  const handleReply = useCallback((message: MessageWithDetails) => {
    setReplyingTo({
      id: message.id,
      userName: message.user.name,
      preview: message.content.replace(/<[^>]*>/g, "").substring(0, 50),
    });
  }, []);

  // Handle delete
  const handleDelete = useCallback(
    async (messageId: string) => {
      if (confirm("Are you sure you want to delete this message?")) {
        await deleteMessage(messageId, currentUserId);
      }
    },
    [currentUserId]
  );

  // Handle pin
  const handlePin = useCallback(
    async (messageId: string) => {
      await pinMessage(channel.id, messageId, currentUserId);
    },
    [channel.id, currentUserId]
  );

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Channel Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <div className="flex items-center gap-2">
          {channel.type === "PRIVATE" ? (
            <Lock className="h-5 w-5 text-gray-400" />
          ) : channel.icon ? (
            <span className="text-xl">{channel.icon}</span>
          ) : (
            <Hash className="h-5 w-5 text-gray-400" />
          )}
          <div>
            <h2 className="font-semibold">{channel.name}</h2>
            {channel.description && (
              <p className="text-sm text-gray-500 truncate max-w-md">
                {channel.description}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Sheet open={showMembers} onOpenChange={setShowMembers}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-2">
                <Users className="h-4 w-4" />
                {channel._count.members}
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Channel Members</SheetTitle>
                <SheetDescription>
                  {channel._count.members} members in #{channel.name}
                </SheetDescription>
              </SheetHeader>
              <div className="mt-4 space-y-2">
                {members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50"
                  >
                    <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center">
                      {member.user.avatarUrl ? (
                        <img
                          src={member.user.avatarUrl}
                          alt={member.user.name}
                          className="w-9 h-9 rounded-full"
                        />
                      ) : (
                        <span className="text-sm font-medium text-gray-600">
                          {member.user.name.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{member.user.name}</p>
                      <p className="text-xs text-gray-500">
                        {member.user.department || member.user.role}
                      </p>
                    </div>
                    {member.role !== "MEMBER" && (
                      <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">
                        {member.role.toLowerCase()}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </SheetContent>
          </Sheet>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Settings className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Pin className="h-4 w-4 mr-2" />
                View pinned messages
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Bell className="h-4 w-4 mr-2" />
                Notification preferences
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="h-4 w-4 mr-2" />
                Channel settings
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Message List */}
      <MessageList
        channelId={channel.id}
        initialMessages={initialMessages}
        currentUserId={currentUserId}
        onReply={handleReply}
        onReaction={handleReaction}
        onDelete={handleDelete}
        onPin={handlePin}
        hasMore={hasMore}
      />

      {/* Message Editor */}
      <div className="p-4 border-t">
        <MessageEditor
          channelId={channel.id}
          onSend={handleSendMessage}
          onTyping={handleTyping}
          onStopTyping={handleStopTyping}
          placeholder={`Message #${channel.name}`}
          users={users}
          replyingTo={replyingTo}
          onCancelReply={() => setReplyingTo(null)}
        />
      </div>
    </div>
  );
}
