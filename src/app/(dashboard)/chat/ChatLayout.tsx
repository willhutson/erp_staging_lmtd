"use client";

/**
 * Chat Layout Component
 *
 * Provides the sidebar and main content area for chat.
 *
 * @module app/(dashboard)/chat/ChatLayout
 */

import { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { ChannelSidebar } from "@/modules/chat/components/ChannelSidebar";
import { MessageSearch } from "@/modules/chat/components/MessageSearch";
import { createChannel } from "@/modules/chat/actions/channel-actions";
import type { ChannelType } from "@prisma/client";

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

interface ChatLayoutProps {
  children: ReactNode;
  channels: Channel[];
  directMessages: DirectMessage[];
  unreadCounts: Record<string, number>;
  currentUserId: string;
  organizationId: string;
  users?: Array<{ id: string; name: string; avatarUrl?: string | null }>;
}

export function ChatLayout({
  children,
  channels,
  directMessages,
  unreadCounts,
  currentUserId,
  organizationId,
  users = [],
}: ChatLayoutProps) {
  const router = useRouter();

  const handleCreateChannel = async (data: {
    name: string;
    description?: string;
    type: ChannelType;
  }) => {
    const channel = await createChannel({
      organizationId,
      name: data.name,
      description: data.description,
      type: data.type,
      createdById: currentUserId,
    });

    router.push(`/chat/${channel.slug}`);
    router.refresh();
  };

  // Navigate to search result
  const handleSearchSelect = (result: { channel: { slug: string }; id: string }) => {
    router.push(`/chat/${result.channel.slug}?message=${result.id}`);
  };

  // Format channels for search
  const searchChannels = channels.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
  }));

  return (
    <div className="flex h-[calc(100vh-64px)] -m-6">
      <ChannelSidebar
        channels={channels}
        directMessages={directMessages}
        unreadCounts={unreadCounts}
        currentUserId={currentUserId}
        organizationId={organizationId}
        onCreateChannel={handleCreateChannel}
      />
      <div className="flex-1 flex flex-col">
        {/* Search bar */}
        <div className="flex items-center justify-end px-4 py-2 border-b bg-gray-50/50">
          <MessageSearch
            organizationId={organizationId}
            channels={searchChannels}
            users={users}
            onSelectMessage={handleSearchSelect}
          />
        </div>
        {children}
      </div>
    </div>
  );
}
