"use client";

/**
 * Channel Sidebar Component
 *
 * Displays channel list, DMs, and channel management.
 *
 * @module chat/components/ChannelSidebar
 */

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Hash,
  Lock,
  Plus,
  Search,
  MessageSquare,
  ChevronDown,
  Settings,
  Users,
  MoreHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ChannelType } from "@prisma/client";

// ============================================
// TYPES
// ============================================

interface Channel {
  id: string;
  name: string;
  slug: string;
  type: ChannelType;
  icon: string | null;
  isArchived: boolean;
  _count: {
    members: number;
  };
}

interface DirectMessage {
  id: string;
  name: string;
  slug: string;
  members?: Array<{
    user: {
      id: string;
      name: string;
      avatarUrl: string | null;
    };
  }>;
}

interface ChannelSidebarProps {
  channels: Channel[];
  directMessages: DirectMessage[];
  unreadCounts: Record<string, number>;
  currentUserId: string;
  organizationId: string;
  onCreateChannel?: (data: {
    name: string;
    description?: string;
    type: ChannelType;
  }) => Promise<void>;
}

// ============================================
// COMPONENT
// ============================================

export function ChannelSidebar({
  channels,
  directMessages,
  unreadCounts,
  currentUserId,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  organizationId: _organizationId,
  onCreateChannel,
}: ChannelSidebarProps) {
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newChannelName, setNewChannelName] = useState("");
  const [newChannelType, setNewChannelType] = useState<ChannelType>("PUBLIC");
  const [isCreating, setIsCreating] = useState(false);

  // Filter channels by search
  const filteredChannels = channels.filter((channel) =>
    channel.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filter DMs by search
  const filteredDMs = directMessages.filter((dm) =>
    dm.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get unread count for a channel
  const getUnreadCount = (channelId: string) => unreadCounts[channelId] || 0;

  // Check if channel is active
  const isActiveChannel = (slug: string) =>
    pathname === `/chat/${slug}` || pathname?.startsWith(`/chat/${slug}/`);

  // Handle create channel
  const handleCreateChannel = async () => {
    if (!newChannelName.trim() || !onCreateChannel) return;

    setIsCreating(true);
    try {
      await onCreateChannel({
        name: newChannelName,
        type: newChannelType,
      });
      setShowCreateDialog(false);
      setNewChannelName("");
      setNewChannelType("PUBLIC");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="w-64 bg-gray-900 text-white flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-lg">SpokeChat</h2>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-white">
            <Settings className="h-4 w-4" />
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search channels..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 h-8"
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        {/* Channels Section */}
        <div className="p-2">
          <div className="flex items-center justify-between px-2 py-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-1 text-sm text-gray-400 hover:text-white">
                  <ChevronDown className="h-3 w-3" />
                  <span>Channels</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem>Browse all channels</DropdownMenuItem>
                <DropdownMenuItem>Create channel</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-gray-400 hover:text-white"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Channel</DialogTitle>
                  <DialogDescription>
                    Create a new channel for your team to collaborate.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <label className="text-sm font-medium">Channel Name</label>
                    <Input
                      placeholder="e.g. project-updates"
                      value={newChannelName}
                      onChange={(e) => setNewChannelName(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Visibility</label>
                    <div className="flex gap-2 mt-1">
                      <Button
                        variant={newChannelType === "PUBLIC" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setNewChannelType("PUBLIC")}
                        className="flex-1"
                      >
                        <Hash className="h-4 w-4 mr-1" />
                        Public
                      </Button>
                      <Button
                        variant={newChannelType === "PRIVATE" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setNewChannelType("PRIVATE")}
                        className="flex-1"
                      >
                        <Lock className="h-4 w-4 mr-1" />
                        Private
                      </Button>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setShowCreateDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateChannel}
                    disabled={!newChannelName.trim() || isCreating}
                  >
                    {isCreating ? "Creating..." : "Create Channel"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Channel List */}
          <div className="space-y-0.5 mt-1">
            {filteredChannels.map((channel) => {
              const unread = getUnreadCount(channel.id);
              const isActive = isActiveChannel(channel.slug);

              return (
                <Link
                  key={channel.id}
                  href={`/chat/${channel.slug}`}
                  className={cn(
                    "flex items-center gap-2 px-2 py-1.5 rounded group",
                    isActive
                      ? "bg-[#52EDC7] text-gray-900"
                      : "text-gray-400 hover:bg-gray-800 hover:text-white"
                  )}
                >
                  {channel.type === "PRIVATE" ? (
                    <Lock className="h-4 w-4 flex-shrink-0" />
                  ) : channel.icon ? (
                    <span className="text-sm">{channel.icon}</span>
                  ) : (
                    <Hash className="h-4 w-4 flex-shrink-0" />
                  )}
                  <span className="flex-1 truncate text-sm">{channel.name}</span>
                  {unread > 0 && (
                    <Badge
                      className={cn(
                        "h-5 min-w-[20px] flex items-center justify-center text-xs",
                        isActive
                          ? "bg-gray-900 text-white"
                          : "bg-red-500 text-white"
                      )}
                    >
                      {unread > 99 ? "99+" : unread}
                    </Badge>
                  )}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        className={cn(
                          "opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-gray-700",
                          isActive && "hover:bg-gray-200"
                        )}
                        onClick={(e) => e.preventDefault()}
                      >
                        <MoreHorizontal className="h-3 w-3" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Users className="h-4 w-4 mr-2" />
                        View members
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Settings className="h-4 w-4 mr-2" />
                        Channel settings
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </Link>
              );
            })}
            {filteredChannels.length === 0 && (
              <p className="text-sm text-gray-500 px-2 py-4 text-center">
                No channels found
              </p>
            )}
          </div>
        </div>

        {/* Direct Messages Section */}
        <div className="p-2 border-t border-gray-800">
          <div className="flex items-center justify-between px-2 py-1">
            <button className="flex items-center gap-1 text-sm text-gray-400 hover:text-white">
              <ChevronDown className="h-3 w-3" />
              <span>Direct Messages</span>
            </button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-gray-400 hover:text-white"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {/* DM List */}
          <div className="space-y-0.5 mt-1">
            {filteredDMs.map((dm) => {
              const unread = getUnreadCount(dm.id);
              const isActive = isActiveChannel(dm.slug);
              const otherUser = dm.members?.find(
                (m) => m.user.id !== currentUserId
              )?.user;

              return (
                <Link
                  key={dm.id}
                  href={`/chat/${dm.slug}`}
                  className={cn(
                    "flex items-center gap-2 px-2 py-1.5 rounded",
                    isActive
                      ? "bg-[#52EDC7] text-gray-900"
                      : "text-gray-400 hover:bg-gray-800 hover:text-white"
                  )}
                >
                  {otherUser?.avatarUrl ? (
                    <img
                      src={otherUser.avatarUrl}
                      alt={otherUser.name}
                      className="w-5 h-5 rounded-full"
                    />
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-gray-600 flex items-center justify-center">
                      <span className="text-xs">
                        {(otherUser?.name || dm.name).charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <span className="flex-1 truncate text-sm">
                    {otherUser?.name || dm.name}
                  </span>
                  {unread > 0 && (
                    <Badge
                      className={cn(
                        "h-5 min-w-[20px] flex items-center justify-center text-xs",
                        isActive
                          ? "bg-gray-900 text-white"
                          : "bg-red-500 text-white"
                      )}
                    >
                      {unread > 99 ? "99+" : unread}
                    </Badge>
                  )}
                </Link>
              );
            })}
            {filteredDMs.length === 0 && (
              <p className="text-sm text-gray-500 px-2 py-4 text-center">
                No conversations yet
              </p>
            )}
          </div>
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-3 border-t border-gray-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#52EDC7] flex items-center justify-center">
            <MessageSquare className="h-4 w-4 text-gray-900" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">SpokeChat</p>
            <p className="text-xs text-gray-500">Internal Communications</p>
          </div>
        </div>
      </div>
    </div>
  );
}
